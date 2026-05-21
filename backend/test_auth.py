"""Roda com: python test_auth.py"""
import httpx
from config import settings

print(f"Email carregado : {settings.jira_email}")
print(f"Token (primeiros 10 chars): {settings.jira_api_token[:10]}...")
print(f"Token length: {len(settings.jira_api_token)}")

url = f"{settings.jira_base_url}/rest/api/3/myself"
resp = httpx.get(url, auth=httpx.BasicAuth(settings.jira_email, settings.jira_api_token))
print(f"\nStatus: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Autenticado como: {data.get('displayName')} ({data.get('emailAddress')})")
else:
    print(f"Erro: {resp.text[:300]}")
