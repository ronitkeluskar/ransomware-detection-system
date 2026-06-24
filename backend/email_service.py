"""Send password reset email via SMTP, or use Ethereal Email fallback when SMTP is not configured."""
import os
import smtplib
import urllib.request
import json
from email.message import EmailMessage

_ethereal_account = None

def get_ethereal_account():
    global _ethereal_account
    if _ethereal_account:
        return _ethereal_account
    try:
        print("[XENON] Generating temporary Ethereal test email account...")
        req = urllib.request.Request(
            'https://api.nodemailer.com/user',
            data=b'{"requestor":"XENON","version":"1.0"}',
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            _ethereal_account = json.loads(res.read().decode())
        return _ethereal_account
    except Exception as e:
        print(f"[XENON] Failed to create Ethereal account: {e}")
        return None

def send_password_reset_email(to_email: str, reset_link: str) -> tuple[bool, str | None]:
    """
    Returns (success, error_message).
    If SMTP_HOST is not set, generates a test Ethereal Email account.
    """
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587") or "587")
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASSWORD", "").strip()
    sender = os.environ.get("SMTP_FROM", user or "").strip()

    is_ethereal = False

    if not host or not sender:
        print(
            f"\n{'=' * 60}\n[XENON] Real SMTP not configured. Using Ethereal Email fallback.\n"
            f"  Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM in backend/.env to use your own email.\n"
            f"{'=' * 60}\n"
        )
        account = get_ethereal_account()
        if not account:
            # Fallback to console print if ethereal fails
            print(f"[XENON] Could not use Ethereal. Printing reset link here:\nLink: {reset_link}\n")
            return True, None
        
        host = account['smtp']['host']
        port = account['smtp']['port']
        user = account['user']
        password = account['pass']
        sender = user
        is_ethereal = True

    try:
        msg = EmailMessage()
        msg["Subject"] = "Reset your XENON Security password"
        msg["From"] = sender
        msg["To"] = to_email
        msg.set_content(
            "You requested a password reset for your XENON Security account.\n\n"
            f"Open this link to choose a new password (valid for 1 hour):\n\n{reset_link}\n\n"
            "If you did not request this, you can ignore this email.\n"
        )

        with smtplib.SMTP(host, port, timeout=45) as smtp:
            smtp.starttls()
            if user and password:
                smtp.login(user, password)
            smtp.send_message(msg)
            
        if is_ethereal:
            print(
                f"\n[XENON] \u2705 Ethereal test email sent to {to_email}!\n"
                f"  -> View your email here: https://ethereal.email/login\n"
                f"  -> Email: {user}\n"
                f"  -> Password: {password}\n"
            )
        return True, None
    except Exception as e:
        return False, str(e)
