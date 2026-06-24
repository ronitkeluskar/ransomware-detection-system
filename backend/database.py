import bcrypt
import hashlib
import secrets
import time
from pymongo import MongoClient

RESET_TOKEN_TTL_SEC = 3600


class Database:
    def __init__(self):
        # Update this URI if using MongoDB Atlas
        self.uri = "mongodb://localhost:27017/"
        self.client = None
        self.users = None
        self.password_resets = None
        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=2000)
            self.db = self.client["xenon_db"]
            self.users = self.db["users"]
            self.password_resets = self.db["password_resets"]
            self.client.admin.command("ping")
        except Exception as e:
            print(f"Could not connect to MongoDB: {e}")
            self.users = None
            self.password_resets = None

    def create_user(self, first_name, last_name, email, password):
        if self.users is None: return False, "Database connection failed."
        if self.users.find_one({"email": email.lower()}):
            return False, "Email already registered."

        # Hash the password for security
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email.lower(),
            "password": hashed_pw
        }
        self.users.insert_one(user_data)
        return True, "Account created successfully!"

    def authenticate_user(self, email, password):
        if self.users is None: return False, "Database connection failed."
        user = self.users.find_one({"email": email.lower()})
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
            # This 'user' dictionary contains first_name and last_name
            return True, {
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"]
            }
        return False, "Invalid email or password."

    def create_password_reset_request(self, email: str):
        """
        If the user exists, store a hashed token and return the plain token for email.
        Returns (ok, plain_token_or_none, error_message).
        plain_token is None when user does not exist (caller must not leak that).
        """
        if self.users is None or self.password_resets is None:
            return False, None, "Database connection failed."
        email_l = email.strip().lower()
        user = self.users.find_one({"email": email_l})
        if not user:
            return True, None, None

        plain = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(plain.encode("utf-8")).hexdigest()
        expires_at = time.time() + RESET_TOKEN_TTL_SEC
        self.password_resets.delete_many({"email": email_l})
        self.password_resets.insert_one(
            {"email": email_l, "token_hash": token_hash, "expires_at": expires_at}
        )
        return True, plain, None

    def verify_reset_token(self, plain_token: str):
        """Returns (ok, email_or_none, error_message). Does not consume the token."""
        if self.users is None or self.password_resets is None:
            return False, None, "Database connection failed."
        if not plain_token or len(plain_token) < 10:
            return False, None, "Invalid reset link."
        token_hash = hashlib.sha256(plain_token.strip().encode("utf-8")).hexdigest()
        doc = self.password_resets.find_one({"token_hash": token_hash})
        if not doc:
            return False, None, "Invalid or expired reset link."
        if doc["expires_at"] < time.time():
            self.password_resets.delete_one({"_id": doc["_id"]})
            return False, None, "This reset link has expired. Request a new one."
        return True, doc["email"], None

    def reset_password_with_token(self, plain_token: str, new_password: str):
        """Consumes the reset token and updates the user's password."""
        ok, email, err = self.verify_reset_token(plain_token)
        if not ok:
            return False, err
        if len(new_password) < 8:
            return False, "Password must be at least 8 characters."
        hashed_pw = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        result = self.users.update_one({"email": email}, {"$set": {"password": hashed_pw}})
        if result.matched_count == 0:
            return False, "User not found."
        self.password_resets.delete_many({"email": email})
        return True, "Password updated successfully. You can sign in now."

# Global instance
db_controller = Database()
