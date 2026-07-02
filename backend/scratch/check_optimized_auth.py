import asyncio
import time
import sys
import os

# Add parent directory to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

async def main():
    print("Importing get_password_hash_async and verify_password_async...")
    from app.core.auth import get_password_hash_async, verify_password_async
    
    password = "MyTestPassword123!"
    
    print("\n[TEST 1] Hashing password asynchronously...")
    start = time.time()
    hashed = await get_password_hash_async(password)
    hashing_duration = time.time() - start
    print(f"Hashed: {hashed}")
    print(f"Hashing duration: {hashing_duration:.4f} seconds")
    
    print("\n[TEST 2] Verifying password asynchronously (correct password)...")
    start = time.time()
    is_valid = await verify_password_async(password, hashed)
    verify_duration = time.time() - start
    print(f"Verified: {is_valid}")
    print(f"Verify duration: {verify_duration:.4f} seconds")
    assert is_valid is True, "Password verification failed!"
    
    print("\n[TEST 3] Verifying password asynchronously (incorrect password)...")
    start = time.time()
    is_valid_wrong = await verify_password_async("WrongPassword", hashed)
    print(f"Verified wrong: {is_valid_wrong}")
    assert is_valid_wrong is False, "Wrong password verification should be False!"
    
    print("\n🎉 All tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
