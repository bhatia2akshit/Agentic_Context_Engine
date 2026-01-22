import os
from dotenv import load_dotenv

load_dotenv('.env.local')

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# Removed hardcoded PDF_FILENAME and SESSION_JSON_PATH
# These will now be provided via API