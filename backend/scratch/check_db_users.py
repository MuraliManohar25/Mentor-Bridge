import sqlite3

def check_db(db_name):
    print(f"\n--- Checking {db_name} ---")
    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tables in DB: {tables}")
        
        if "users" in tables:
            cursor.execute("SELECT id, email, role, full_name, is_active, is_verified, verification_status FROM users")
            users = cursor.fetchall()
            print(f"Total Users: {len(users)}")
            for user in users:
                print(f"ID: {user[0]}")
                print(f"  Email: {user[1]}")
                print(f"  Role: {user[2]}")
                print(f"  Name: {user[3]}")
                print(f"  Active: {user[4]}")
                print(f"  Verified: {user[5]}")
                print(f"  Verification Status: {user[6]}")
        else:
            print("No 'users' table found.")
            
        conn.close()
    except Exception as e:
        print(f"Error checking {db_name}: {e}")

check_db("mentor_bridge.db")
check_db("gradconnect.db")
