from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="RBAC Evaluation Engine")

# Mock Database for Roles and Permissions
roles_db = {
    "admin": ["read:docs", "write:docs", "delete:docs"],
    "editor": ["read:docs", "write:docs"],
    "viewer": ["read:docs"]
}

# Mock Database for Users -> Roles
users_db = {
    "alice": "admin",
    "bob": "editor",
    "charlie": "viewer"
}

class AccessRequest(BaseModel):
    user: str
    action: str

@app.post("/api/v1/evaluate")
def evaluate_access(req: AccessRequest):
    role = users_db.get(req.user)
    if not role:
        raise HTTPException(status_code=403, detail="User not found or has no role assigned")
    
    permissions = roles_db.get(role, [])
    
    if req.action in permissions:
        return {"allowed": True, "reason": f"Role '{role}' grants '{req.action}'"}
    
    return {"allowed": False, "reason": f"Role '{role}' does not grant '{req.action}'"}

@app.get("/api/v1/matrix")
def get_matrix():
    # Used by the React Dashboard to build the UI
    return {
        "roles": roles_db,
        "users": users_db
    }
