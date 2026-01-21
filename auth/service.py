users_db = {
    "testuser": {"username": "testuser", "password": "testpassword"},
}

def authenticate_user(username: str, password: str):
    user = users_db.get(username)
    if not user or user["password"] != password:
        return None
    return user
