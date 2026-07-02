"""
Diagnose login issues:
1. Check if existing DB password hashes are compatible with new bcrypt verification
2. Dump all user emails, roles, and hash prefixes
3. Test password verification against stored hashes
"""
import sqlite3
import bcrypt
import sys, os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./mentor_bridge.db"
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

DB_PATH = "mentor_bridge.db"
TEST_PASSWORD = "Demo123!"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT email, role, hashed_password, is_active, is_verified, verification_status FROM users")
users = cursor.fetchall()

print("=" * 70)
print("DATABASE USER DIAGNOSTICS")
print("=" * 70)

for email, role, hashed_pw, is_active, is_verified, verification_status in users:
    print(f"\nEmail: {email}")
    print(f"  Role: {role}")
    print(f"  Hash prefix: {hashed_pw[:30]}...")
    print(f"  Hash length: {len(hashed_pw)}")
    print(f"  is_active: {is_active}")
    print(f"  is_verified: {is_verified}")
    print(f"  verification_status: {verification_status}")
    
    # Test if Demo123! works with new direct bcrypt
    try:
        result = bcrypt.checkpw(TEST_PASSWORD.encode('utf-8'), hashed_pw.encode('utf-8'))
        print(f"  Password '{TEST_PASSWORD}' matches: {result}")
    except Exception as e:
        print(f"  Password verification ERROR: {e}")

conn.close()

print("\n" + "=" * 70)
print("ROLE ENUM COMPARISON TEST")
print("=" * 70)

from app.models.user import UserRole

# Test how roles compare (frontend sends lowercase)
frontend_roles = ['student', 'alumni', 'admin']
for fr in frontend_roles:
    try:
        enum_val = UserRole(fr)
        print(f"  UserRole('{fr}') = {enum_val}, value = {enum_val.value}")
    except Exception as e:
        print(f"  UserRole('{fr}') FAILED: {e}")

# Check uppercase comparison
print("\nDirect string comparison tests:")
for fr in frontend_roles:
    for ur in UserRole:
        match = ur == fr
        match_val = ur.value == fr
        if match or match_val:
            print(f"  UserRole.{ur.name} == '{fr}' -> {match}")
            print(f"  UserRole.{ur.name}.value == '{fr}' -> {match_val}")
