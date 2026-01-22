import os
from dotenv import load_dotenv

load_dotenv('.env.local')

_jwt_secret_key = os.getenv("JWT_SECRET_KEY")
if not _jwt_secret_key:
    raise RuntimeError(
        "JWT_SECRET_KEY is not set. Add it to `.env.local` (loaded by backend/core/config.py) "
        "or export it in your environment."
    )

SECRET_KEY: str = _jwt_secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Removed hardcoded PDF_FILENAME and SESSION_JSON_PATH
# These will now be provided via API
