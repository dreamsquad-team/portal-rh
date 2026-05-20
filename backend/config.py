from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jira_base_url: str = "https://api.atlassian.com/ex/jira/5da18bf8-7073-4d7d-9636-d977f6a29101"
    jira_email: str
    jira_api_token: str
    jira_project_key: str = "SR"
    jira_issue_type_id: str = "10622"

    google_sheets_id: str
    google_credentials_file: str = "google-credentials.json"

    class Config:
        env_file = ".env"


settings = Settings()
