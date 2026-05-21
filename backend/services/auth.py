import json
from pathlib import Path

USERS_FILE = Path(__file__).parent.parent / "users.json"


def _load() -> dict:
    if not USERS_FILE.exists():
        return {"users": []}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict) -> None:
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_user(email: str) -> dict | None:
    email = email.lower().strip()
    return next((u for u in _load()["users"] if u["email"].lower() == email), None)


def list_users() -> list[dict]:
    return _load()["users"]


def upsert_user(email: str, name: str, role: str) -> dict:
    data = _load()
    email = email.lower().strip()
    for u in data["users"]:
        if u["email"].lower() == email:
            u["name"] = name
            u["role"] = role
            _save(data)
            return u
    user = {"email": email, "name": name, "role": role}
    data["users"].append(user)
    _save(data)
    return user


def delete_user(email: str) -> None:
    data = _load()
    email = email.lower().strip()
    data["users"] = [u for u in data["users"] if u["email"].lower() != email]
    _save(data)
