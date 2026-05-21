"""Roda com: python test_match.py"""
from services.jira import fetch_vacation_requests
from services.sheets import fetch_employees, normalize

jira_data = fetch_vacation_requests()
sheet_data = fetch_employees()

print("=== NOMES NA PLANILHA (normalizados) ===")
for key in sorted(sheet_data.keys()):
    print(f"  '{key}'  →  original: '{sheet_data[key]['name']}'  admissão: {sheet_data[key]['admission_date']}")

print("\n=== NOMES NO JIRA (normalizados) ===")
seen = {}
for req in jira_data:
    email = req["employee_email"]
    if email not in seen:
        seen[email] = req["employee_name"]
        key = normalize(req["employee_name"])
        match = sheet_data.get(key)
        if not match:
            for sk, sd in sheet_data.items():
                if sk in key or key in sk:
                    match = sd
                    break
        status = f"✅ match: '{match['name']}'" if match else "❌ sem match"
        print(f"  '{key}'  →  original: '{req['employee_name']}'  {status}")
