from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .services.jira import fetch_vacation_requests
from .services.sheets import fetch_employees
from .services.vacation import merge_employee_data

app = FastAPI(title="HR Vacations API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/employees")
def list_employees():
    try:
        jira_data = fetch_vacation_requests()
        sheet_data = fetch_employees()
        return merge_employee_data(jira_data, sheet_data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/employees/{email:path}")
def get_employee(email: str):
    try:
        jira_data = fetch_vacation_requests()
        sheet_data = fetch_employees()
        all_employees = merge_employee_data(jira_data, sheet_data)
        match = next((e for e in all_employees if e["email"] == email.lower()), None)
        if not match:
            raise HTTPException(status_code=404, detail="Employee not found")
        return match
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
def health():
    return {"status": "ok"}
