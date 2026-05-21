"""Roda com: python test_sheets.py"""
import gspread
from google.oauth2.service_account import Credentials
from config import settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

print(f"Sheets ID : '{settings.google_sheets_id}'")
print(f"Credentials file: {settings.google_credentials_file}")

creds = Credentials.from_service_account_file(settings.google_credentials_file, scopes=SCOPES)
print(f"Service account email: {creds.service_account_email}")

gc = gspread.authorize(creds)
try:
    sheet = gc.open_by_key(settings.google_sheets_id)
    print(f"\nPlanilha encontrada: {sheet.title}")
    all_values = sheet.sheet1.get_all_values()
    print(f"Linhas de dados: {len(all_values) - 1}")
    for i, row in enumerate(all_values[:6]):
        print(f"Linha {i+1}: {row}")
except Exception as e:
    print(f"\nErro: {e}")
