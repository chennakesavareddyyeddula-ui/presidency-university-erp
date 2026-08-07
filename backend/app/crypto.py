import base64
import json
import hashlib
from cryptography.fernet import Fernet
from app.config import ENCRYPTION_KEY

def derive_fernet_key(secret: str) -> bytes:
    key = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(key)

# We use the ENCRYPTION_KEY from config directly
fernet = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_embedding(vector: list) -> str:
    data_str = json.dumps(vector)
    encrypted_bytes = fernet.encrypt(data_str.encode())
    return base64.b64encode(encrypted_bytes).decode()

def decrypt_embedding(encrypted_str: str) -> list:
    encrypted_bytes = base64.b64decode(encrypted_str)
    decrypted_bytes = fernet.decrypt(encrypted_bytes)
    return json.loads(decrypted_bytes.decode())
