from datetime import date, datetime
from typing import Optional
import gspread
from google.oauth2.service_account import Credentials
from ..config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def _client() -> gspread.Client:
    creds = Credentials.from_service_account_file(
        settings.google_credentials_file, scopes=SCOPES
    )
    return gspread.authorize(creds)


def _parse_date(value: str) -> Optional[date]:
    if not value:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except ValueError:
            continue
    return None


def fetch_employees() -> dict[str, dict]:
    """Returns a dict keyed by lowercase email with employee data from Sheets."""
    gc = _client()
    sheet = gc.open_by_key(settings.google_sheets_id).sheet1
    rows = sheet.get_all_records()

    employees: dict[str, dict] = {}
    for row in rows:
        email = str(row.get("email", row.get("Email", row.get("e-mail", "")))).strip().lower()
        if not email:
            continue
        admission_raw = str(row.get(
            "data_admissao",
            row.get("data admissão",
            row.get("Data de Admissão",
            row.get("admissao", ""))),
        )).strip()
        admission_date = _parse_date(admission_raw)

        employees[email] = {
            "name": str(row.get("nome", row.get("Nome", row.get("name", "")))).strip(),
            "email": email,
            "admission_date": admission_date.isoformat() if admission_date else None,
            "department": str(row.get("departamento", row.get("Departamento", row.get("area", "")))).strip(),
            "position": str(row.get("cargo", row.get("Cargo", row.get("position", "")))).strip(),
        }
    return employees
