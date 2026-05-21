import unicodedata
from datetime import date
from typing import Optional


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name.lower().strip())
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def _years(admission_date: Optional[str], today: date) -> Optional[float]:
    if not admission_date:
        return None
    try:
        start = date.fromisoformat(admission_date)
        return round((today - start).days / 365.25, 2)
    except ValueError:
        return None


def _next_anniversary(admission_date: Optional[str], today: date) -> Optional[str]:
    if not admission_date:
        return None
    try:
        start = date.fromisoformat(admission_date)
        years_elapsed = (today - start).days // 365
        for delta in (years_elapsed + 1, years_elapsed + 2):
            try:
                candidate = start.replace(year=start.year + delta)
                if candidate > today:
                    return candidate.isoformat()
            except ValueError:
                # Feb 29 edge case
                candidate = date(start.year + delta, start.month + 1, 1)
                if candidate > today:
                    return candidate.isoformat()
    except ValueError:
        return None
    return None


def _first_last(name: str) -> tuple[str, str]:
    parts = name.split()
    return (parts[0], parts[-1]) if len(parts) >= 2 else (name, name)


def _find_sheet_match(name_key: str, sheet_employees: dict[str, dict]) -> dict:
    # 1. Exact match
    if name_key in sheet_employees:
        return sheet_employees[name_key]

    # 2. Username format: "marcus.virgilio" → "marcus virgilio"
    clean = name_key.replace(".", " ")
    if clean != name_key and clean in sheet_employees:
        return sheet_employees[clean]

    # 3. Substring match (e.g. "mateus fortunato" ⊂ "mateus fortunato santana")
    for key in sheet_employees:
        if key in name_key or name_key in key:
            return sheet_employees[key]

    # 4. First + last name match (e.g. "alesson caldeirao de moura" ↔ "alesson moura")
    first_j, last_j = _first_last(clean)
    candidates = [
        data for key, data in sheet_employees.items()
        if _first_last(key) == (first_j, last_j)
    ]
    if len(candidates) == 1:
        return candidates[0]

    return {}


def _make_entry(name: str, email: str, admission: Optional[str], today: date) -> dict:
    years = _years(admission, today)
    return {
        "name": name,
        "email": email,
        "admission_date": admission,
        "years_of_service": years,
        "completed_one_year": years is not None and years >= 1.0,
        "next_anniversary": _next_anniversary(admission, today),
        "has_open_request": False,
        "current_balance": None,
        "total_days_taken": 0,
        "latest_request": None,
        "requests": [],
    }


def merge_employee_data(jira_requests: list[dict], sheet_employees: dict[str, dict]) -> list[dict]:
    """
    Shows everyone: Sheets employees (even without Jira requests) +
    Jira-only employees (ex-employees or not yet in Sheets).
    Key is normalized name; email filled in from Jira when matched.
    """
    today = date.today()
    by_key: dict[str, dict] = {}

    # Seed with all Sheets employees so they appear even without requests
    for sheet_key, data in sheet_employees.items():
        by_key[sheet_key] = _make_entry(data["name"], "", data.get("admission_date"), today)

    # Process every Jira request
    for req in jira_requests:
        email = req["employee_email"].lower()
        name_key = normalize(req["employee_name"])
        sheet_match = _find_sheet_match(name_key, sheet_employees)

        # Which key to use: prefer the Sheets canonical name when matched
        emp_key = normalize(sheet_match["name"]) if sheet_match else name_key

        if emp_key not in by_key:
            admission = sheet_match.get("admission_date") if sheet_match else None
            by_key[emp_key] = _make_entry(req["employee_name"], email, admission, today)

        emp = by_key[emp_key]

        # Fill email from Jira when Sheets entry had none
        if not emp["email"] and email:
            emp["email"] = email

        is_active = req["status_category"] in ("new", "indeterminate")
        if is_active:
            emp["has_open_request"] = True

        if req["days_taken"]:
            emp["total_days_taken"] += req["days_taken"]

        if emp["latest_request"] is None or is_active:
            emp["latest_request"] = {
                "issue_key": req["issue_key"],
                "status": req["status"],
                "status_category": req["status_category"],
                "start_date": req["start_date"],
                "end_date": req["end_date"],
                "days_taken": req["days_taken"],
                "balance": req["balance"],
                "jira_url": req["jira_url"],
            }
            emp["current_balance"] = req["balance"]

        emp["requests"].append({
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

    return sorted(by_key.values(), key=lambda e: e["name"].lower())
