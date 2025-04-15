from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import credentials, auth, initialize_app
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
from jose import JWTError, jwt
import pathlib

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="CloudVault Auth Service")

# Security scheme for JWT
security = HTTPBearer()

# Firebase Admin SDK initialization
try:
    # Get the directory where this file is located
    current_dir = pathlib.Path(__file__).parent.absolute()
    # Construct the path to the firebase_admin_sdk.json file
    firebase_credentials_path = os.path.join(current_dir, "firebase_admin_sdk.json")
    
    cred = credentials.Certificate(firebase_credentials_path)
    initialize_app(cred)
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    raise

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class UserCreate(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/register", response_model=Token)
async def register_user(user: UserCreate):
    try:
        # Create user in Firebase
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.display_name
        )
        
        # Create JWT token
        token_data = {
            "sub": user_record.uid,
            "email": user.email
        }
        access_token = create_access_token(token_data)
        
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/login", response_model=Token)
async def login_user(user: UserLogin):
    try:
        # Verify user credentials with Firebase
        user_record = auth.get_user_by_email(user.email)
        
        # Create JWT token
        token_data = {
            "sub": user_record.uid,
            "email": user.email
        }
        access_token = create_access_token(token_data)
        
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

@app.get("/protected")
async def protected_route(token_data: dict = Depends(verify_token)):
    return {
        "message": "This is a protected route",
        "user_id": token_data["sub"],
        "email": token_data["email"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 