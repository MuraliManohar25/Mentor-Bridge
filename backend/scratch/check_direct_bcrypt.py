import time
import bcrypt

print("Hashing a test password with direct bcrypt...")
start_time = time.time()
pwd_bytes = "Demo123!".encode('utf-8')
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(pwd_bytes, salt)
hash_duration = time.time() - start_time
print(f"Direct Hash duration: {hash_duration:.4f} seconds")

print("Verifying password with direct bcrypt...")
start_time = time.time()
verified = bcrypt.checkpw(pwd_bytes, hashed)
verify_duration = time.time() - start_time
print(f"Direct Verify duration: {verify_duration:.4f} seconds")
print(f"Verified: {verified}")
