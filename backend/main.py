import logging
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import settings
from services.jira import fetch_vacation_requests
from services.sheets import fetch_employees
from services.vacation import merge_employee_data
from services.jsm import lookup_account_id, create_vacation_request, update_issue_fields
from services.auth import get_user, list_users, upsert_user, delete_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HR Vacations API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


def _load_sheet_data() -> dict:
    try:
        return fetch_employees()
    except Exception:
        logger.warning("Google Sheets unavailable — admission dates will be empty:\n%s", traceback.format_exc())
        return {}


@app.get("/api/employees")
def list_employees():
    try:
        jira_data = fetch_vacation_requests()
        sheet_data = _load_sheet_data()
        return merge_employee_data(jira_data, sheet_data)
    except Exception as exc:
        logger.error("Error in /api/employees:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/employees/{email:path}")
def get_employee(email: str):
    try:
        jira_data = fetch_vacation_requests()
        sheet_data = _load_sheet_data()
        all_employees = merge_employee_data(jira_data, sheet_data)
        match = next((e for e in all_employees if e["email"] == email.lower()), None)
        if not match:
            raise HTTPException(status_code=404, detail="Employee not found")
        return match
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error in /api/employees/%s:\n%s", email, traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(exc))


class VacationRequestCreate(BaseModel):
    employee_email: str
    employee_name: str
    contract_type: str
    start_date: str   # YYYY-MM-DD
    end_date: str     # YYYY-MM-DD


@app.post("/api/requests")
async def create_request(payload: VacationRequestCreate):
    try:
        account_id = await lookup_account_id(payload.employee_email)

        field_values: dict = {
            "summary": payload.employee_name,
            "customfield_10015": payload.start_date,
            "duedate": payload.end_date,
        }

        result = await create_vacation_request(
            service_desk_id="34",
            request_type_id="49",
            field_values=field_values,
            raise_on_behalf_of=account_id,
        )
        issue_key = result.get("issueKey")

        # Update contract type via standard issue API (not accepted by JSM request API)
        if issue_key and payload.contract_type:
            try:
                await update_issue_fields(issue_key, {
                    "customfield_11349": {"value": payload.contract_type},
                })
            except Exception:
                logger.warning("Could not set contract_type on %s", issue_key)

        return {
            "issue_key": issue_key,
            "jira_url": f"https://dreamsquad.atlassian.net/browse/{issue_key}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error("Error in POST /api/requests:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(exc))


class GoogleTokenPayload(BaseModel):
    token: str


@app.post("/api/auth/google")
def google_login(payload: GoogleTokenPayload):
    try:
        import httpx as _httpx
        r = _httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.token},
            timeout=10,
        )
        if not r.is_success:
            raise ValueError(r.text)
        idinfo = r.json()
        if idinfo.get("aud") != settings.google_oauth_client_id:
            raise ValueError("Audience mismatch")
    except Exception as exc:
        logger.error("Google token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Token do Google inválido.")

    email: str = idinfo.get("email", "").lower()
    name: str = idinfo.get("name") or email.split("@")[0]

    if not email.endswith("@dreamsquad.com.br"):
        raise HTTPException(status_code=403, detail="Apenas contas @dreamsquad.com.br podem acessar.")

    user = get_user(email)
    if not user:
        # First access: auto-create with 'user' role
        user = upsert_user(email, name, "user")
    else:
        # Keep name in sync with Google profile
        user = upsert_user(email, name, user["role"])

    return user


@app.get("/api/admin/users")
def get_users():
    return list_users()


class UserPayload(BaseModel):
    email: str
    name: str
    role: str


@app.post("/api/admin/users")
def save_user(payload: UserPayload):
    if payload.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role deve ser 'admin' ou 'user'.")
    return upsert_user(payload.email, payload.name, payload.role)


@app.delete("/api/admin/users/{email:path}")
def remove_user(email: str):
    delete_user(email)
    return {"ok": True}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/debug/request-fields")
async def debug_request_fields():
    """Returns the required fields for service desk 34, request type 49."""
    import httpx
    from config import settings
    base = settings.jira_base_url
    auth = httpx.BasicAuth(settings.jira_email, settings.jira_api_token)
    headers = {"Accept": "application/json"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{base}/rest/servicedeskapi/servicedesk/34/requesttype/49/field",
            auth=auth, headers=headers,
        )
        return r.json()


@app.get("/api/debug/servicedesks")
async def debug_servicedesks():
    """Lists all service desks and request types to find correct IDs."""
    import httpx
    from config import settings
    base = settings.jira_base_url
    auth = httpx.BasicAuth(settings.jira_email, settings.jira_api_token)
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{base}/rest/servicedeskapi/servicedesk", auth=auth, headers=headers)
        r.raise_for_status()
        desks = r.json().get("values", [])

        result = []
        for desk in desks:
            desk_id = desk["id"]
            rt_r = await client.get(
                f"{base}/rest/servicedeskapi/servicedesk/{desk_id}/requesttype",
                auth=auth, headers=headers,
            )
            request_types = rt_r.json().get("values", []) if rt_r.is_success else []
            result.append({
                "id": desk_id,
                "projectKey": desk.get("projectKey"),
                "projectName": desk.get("projectName"),
                "request_types": [
                    {"id": rt["id"], "name": rt["name"]} for rt in request_types
                ],
            })
        return result
