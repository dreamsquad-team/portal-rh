import httpx
from config import settings

_AUTH = (settings.jira_email, settings.jira_api_token)
_BASE = settings.jira_base_url


async def lookup_account_id(email: str) -> str | None:
    """Find Jira accountId by email address."""
    url = f"{_BASE}/rest/api/3/user/search"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            url,
            params={"query": email},
            auth=httpx.BasicAuth(*_AUTH),
            headers={"Accept": "application/json"},
        )
        if r.status_code == 200:
            users = r.json()
            for u in users:
                if u.get("emailAddress", "").lower() == email.lower():
                    return u["accountId"]
            if users:
                return users[0]["accountId"]
    return None


async def update_issue_fields(issue_key: str, fields: dict) -> None:
    """Updates arbitrary fields on an existing issue via the standard Jira REST API."""
    url = f"{_BASE}/rest/api/3/issue/{issue_key}"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.put(
            url,
            json={"fields": fields},
            auth=httpx.BasicAuth(*_AUTH),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
        )
        if not r.is_success and r.status_code != 204:
            detail = r.text
            raise ValueError(f"Jira update {r.status_code}: {detail}")


async def create_vacation_request(
    service_desk_id: str,
    request_type_id: str,
    field_values: dict,
    raise_on_behalf_of: str | None = None,
) -> dict:
    url = f"{_BASE}/rest/servicedeskapi/request"
    body: dict = {
        "serviceDeskId": service_desk_id,
        "requestTypeId": request_type_id,
        "requestFieldValues": field_values,
    }
    if raise_on_behalf_of:
        body["raiseOnBehalfOf"] = raise_on_behalf_of

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            url,
            json=body,
            auth=httpx.BasicAuth(*_AUTH),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
        )
        if not r.is_success:
            try:
                err = r.json()
                detail = (
                    err.get("errorMessage")
                    or err.get("message")
                    or "; ".join(err.get("errors", {}).values())
                    or r.text
                )
            except Exception:
                detail = r.text
            raise ValueError(f"Jira {r.status_code}: {detail}")
        return r.json()
