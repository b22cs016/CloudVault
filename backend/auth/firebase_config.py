import firebase_admin
from firebase_admin import credentials, auth
import os

# Load Firebase Admin SDK credentials
cred = credentials.Certificate("backend/firebase_admin_sdk.json")
firebase_admin.initialize_app(cred)

print("✅ Firebase Admin SDK initialized successfully!")
