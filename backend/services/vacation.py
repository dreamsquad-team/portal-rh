from datetime import date, timedelta
from typing import Optional


def years_of_service(admission_date: Optional[str], today: Optional[date] = None) -> Optional[float]:
    if not admission_date:
        return None
    try:
        start = date.fromisoformat(admission_date)
    except ValueError:
        return None
    ref = today or date.today()
    delta = ref - start
    return round(delta.days / 365.25, 2)


def completed_one_year(admission_date: Optional[str], today: Optional[date] = None) -> bool:
    years = years_of_service(admission_date, today)
    return years is not None and years >= 1.0


def next_anniversary(admission_date: Optional[str], today: Optional[date] = None) -> Optional[str]:
    """Returns the date of the next 1-year anniversary (or current if not yet reached)."""
    if not admission_date:
        return None
    try:
        start = date.fromisoformat(admission_date)
    except ValueError:
        return None
    ref = today or date.today()
    years_elapsed = (ref - start).days // 365
    candidate = date(start.year + years_elapsed + 1, start.month, start.day)
    if candidate <= ref:
        candidate = date(start.year + years_elapsed + 2, start.month, start.day)
    return candidate.isoformat()


def merge_employee_data(jira_requests: list[dict], sheet_employees: dict[str, dict]) -> list[dict]:
    """Groups Jira requests by employee and merges with Sheets data."""
    today = date.today()
    by_email: dict[str, dict] = {}

    for req in jira_requests:
        email = req["employee_email"].lower()
        if email not in by_email:
            sheet_data = sheet_employees.get(email, {})
            admission = sheet_data.get("admission_date")
            by_email[email] = {
                "name": req["employee_name"],
                "email": email,
                "department": sheet_data.get("department", ""),
                "position": sheet_data.get("position", ""),
                "admission_date": admission,
                "years_of_service": years_of_service(admission, today),
                "completed_one_year": completed_one_year(admission, today),
                "next_anniversary": next_anniversary(admission, today),
                "requests": [],
            }

        entry = by_email[email]

        # Keep most recent name from Jira if Sheets has none
        if not entry["name"] and req["employee_name"]:
            entry["name"] = req["employee_name"]

        entry["requests"].append({
            "issue_key": req["issue_key"],
            "status": req["status"],
            "status_category": req["status_category"],
            "contract_type": req["contract_type"],
            "start_date": req["start_date"],
            "end_date": req["end_date"],
            "days_taken": req["days_taken"],
            "balance": req["balance"],
            "created_at": req["created_at"],
            "jira_url": req["jira_url"],
        })

    # Add employees from Sheets who have no Jira requests yet
    for email, data in sheet_employees.items():
        if email not in by_email:
            admission = data.get("admission_date")
            by_email[email] = {
                "name": data.get("name", ""),
                "email": email,
                "department": data.get("department", ""),
                "position": data.get("position", ""),
                "admission_date": admission,
                "years_of_service": years_of_service(admission, today),
                "completed_one_year": completed_one_year(admission, today),
                "next_anniversary": next_anniversary(admission, today),
                "requests": [],
            }

    result = sorted(by_email.values(), key=lambda e: e["name"].lower())

    # Attach summary fields per employee
    for emp in result:
        reqs = emp["requests"]
        active = [r for r in reqs if r["status_category"] in ("new", "indeterminate")]
        done = [r for r in reqs if r["status_category"] == "done"]
        current = active[0] if active else (done[0] if done else None)

        emp["has_open_request"] = bool(active)
        emp["current_balance"] = current["balance"] if current else None
        emp["total_days_taken"] = sum(
            r["days_taken"] for r in reqs if r["days_taken"] is not None
        )
        emp["latest_request"] = current

    return result
