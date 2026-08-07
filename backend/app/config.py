import os
import base64
import hashlib
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "presidency-university-super-secret-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", None)

if not ENCRYPTION_KEY:
    # Generate a Fernet-compatible key from SECRET_KEY
    key = hashlib.sha256(SECRET_KEY.encode()).digest()
    ENCRYPTION_KEY = base64.urlsafe_b64encode(key).decode()
