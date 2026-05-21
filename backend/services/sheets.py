import unicodedata
from datetime import date, datetime
from typing import Optional
import gspread
from google.oauth2.service_account import Credentials
from config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def _client() -> gspread.Client:
    creds = Credentials.from_service_account_file(
        settings.google_credentials_file, scopes=SCOPES
    )
    return gspread.authorize(creds)


def _parse_date(value: str) -> Optional[date]:
    if not value or value.strip() in ("", "—", "-"):
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except ValueError:
            continue
    return None


def normalize(name: str) -> str:
    nfkd = unicodedata.normalize("NFKD", name.lower().strip())
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def fetch_employees() -> dict[str, dict]:
    """
    Returns dict keyed by normalized name with admission date.
    Row 1 = title, Row 2 = headers, Row 3+ = data.
    """
    gc = _client()
    sheet = gc.open_by_key(settings.google_sheets_id).sheet1
    all_values = sheet.get_all_values()

    if len(all_values) < 3:
        return {}

    headers = [h.replace("\n", " ").strip() for h in all_values[1]]

    employees: dict[str, dict] = {}
    for row_values in all_values[2:]:
        row = dict(zip(headers, row_values))
        name = row.get("Colaborador", "").strip()
        if not name:
            continue

        admission_date = _parse_date(row.get("Data Início", ""))
        employees[normalize(name)] = {
            "name": name,
            "admission_date": admission_date.isoformat() if admission_date else None,
        }

    return employees
