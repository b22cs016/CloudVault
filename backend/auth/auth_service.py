from fastapi import FastAPI, HTTPException, Depends
from firebase_admin import auth, credentials, initialize_app
from pydantic import BaseModel
import os

# Initialize Firebase Admin SDK
firebase_cred_path = "backend/firebase_admin_sdk.json"
if not os.path.exists(firebase_cred_path):
    raise FileNotFoundError(f"Firebase config not found at {firebase_cred_path}")

cred = credentials.Certificate(firebase_cred_path)
initialize_app(cred)

app = FastAPI()

class Token(BaseModel):
    token: str

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

@app.get("/")
def root():
    return {"message": "CloudVault Auth Service is running"}

@app.post("/verify-token/")
def verify_user_token(data: Token):
    user_data = verify_token(data.token)
    return {"user_id": user_data["uid"], "email": user_data.get("email")}

@app.post("/create-user/")
def create_user(email: str, password: str):
    try:
        user = auth.create_user(email=email, password=password)
        return {"user_id": user.uid, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete-user/{user_id}")
def delete_user(user_id: str):
    try:
        auth.delete_user(user_id)
        return {"message": f"User {user_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
