"""
Quick script to add test users to the GradConnect database
Run this to populate your database with sample data
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Test users to create
test_users = [
    {
        "email": "student@demo.com",
        "password": "Demo123!",
        "full_name": "Demo Student",
        "role": "student",
        "graduation_year": 2026,
        "department": "Computer Science"
    },
    {
        "email": "alumni@demo.com",
        "password": "Demo123!",
        "full_name": "Demo Alumni",
        "role": "alumni",
        "graduation_year": 2020,
        "department": "Computer Science"
    },
    {
        "email": "admin@demo.com",
        "password": "Demo123!",
        "full_name": "Demo Admin",
        "role": "admin"
    }
]

print("Creating test users...")
print("=" * 50)

for user in test_users:
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Created: {user['email']} ({user['role']})")
            print(f"   User ID: {data['user']['id']}")
        elif response.status_code == 409:
            print(f"⚠️  Already exists: {user['email']}")
        else:
            print(f"❌ Failed: {user['email']} - {response.text}")
    except Exception as e:
        print(f"❌ Error creating {user['email']}: {e}")

print("=" * 50)
print("\nTest users created! You can now:")
print("1. View them in the database")
print("2. Login with any of these credentials")
print("3. Test the dashboards")
print("\n" + "="*50)
print("DEMO CREDENTIALS:")
print("="*50)
print("\n🎓 STUDENT:")
print("   Email: student@demo.com")
print("   Password: Demo123!")
print("   Role: Select 'Student' in dropdown")
print("\n👔 ALUMNI:")
print("   Email: alumni@demo.com")
print("   Password: Demo123!")
print("   Role: Select 'Alumni' in dropdown")
print("\n⚙️  ADMIN:")
print("   Email: admin@demo.com")
print("   Password: Demo123!")
print("   Role: Select 'Admin' in dropdown")
print("="*50)
