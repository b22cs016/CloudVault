import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("backend/firebase_admin_sdk.json")
firebase_admin.initialize_app(cred)
