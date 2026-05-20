from datetime import date, datetime
from typing import Optional
import httpx
from ..config import settings


FIELDS = [
    "summary", "status", "reporter", "created",
    "customfield_10015",   # Start date
    "customfield_10799",   # Início das férias
    "customfield_10800",   # Fim das férias
    "customfield_11282",   # Dias de férias
    "customfield_11283",   # Saldo de férias
    "customfield_11349",   # Contrato de trabalho
    "duedate",
]


def _auth() -> httpx.BasicAuth:
    return httpx.BasicAuth(settings.jira_email, settings.jira_api_token)


def _parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def fetch_vacation_requests() -> list[dict]:
    jql = (
        f'project = {settings.jira_project_key} '
        f'AND issuetype = "{settings.jira_issue_type_id}" '
        f'ORDER BY created DESC'
    )
    url = f"{settings.jira_base_url}/rest/api/3/search/jql"
    results = []
    start_at = 0
    page_size = 100

    with httpx.Client(auth=_auth(), timeout=30) as client:
        while True:
            resp = client.get(url, params={
                "jql": jql,
                "fields": ",".join(FIELDS),
                "maxResults": page_size,
                "startAt": start_at,
            })
            resp.raise_for_status()
            data = resp.json()
            issues = data.get("issues", [])
            for issue in issues:
                results.append(_parse_issue(issue))
            if start_at + len(issues) >= data.get("total", 0):
                break
            start_at += page_size

    return results


def _parse_issue(issue: dict) -> dict:
    fields = issue["fields"]
    reporter = fields.get("reporter") or {}
    status = fields.get("status") or {}
    contract = fields.get("customfield_11349") or {}

    start_date = (
        _parse_date(fields.get("customfield_10799"))
        or _parse_date(fields.get("customfield_10015"))
    )
    end_date = (
        _parse_date(fields.get("customfield_10800"))
        or _parse_date(fields.get("duedate"))
    )

    days_taken = fields.get("customfield_11282")
    balance = fields.get("customfield_11283")

    # Fallback: calculate days from dates if fields are empty
    if days_taken is None and start_date and end_date:
        days_taken = (end_date - start_date).days + 1

    return {
        "issue_key": issue["key"],
        "employee_name": reporter.get("displayName", fields.get("summary", "")),
        "employee_email": reporter.get("emailAddress", ""),
        "employee_account_id": reporter.get("accountId", ""),
        "status": status.get("name", ""),
        "status_category": status.get("statusCategory", {}).get("key", ""),
        "contract_type": contract.get("value", ""),
        "start_date": start_date.isoformat() if start_date else None,
        "end_date": end_date.isoformat() if end_date else None,
        "days_taken": int(days_taken) if days_taken is not None else None,
        "balance": int(balance) if balance is not None else None,
        "created_at": fields.get("created", "")[:10],
        "jira_url": f"https://dreamsquad.atlassian.net/browse/{issue['key']}",
    }
