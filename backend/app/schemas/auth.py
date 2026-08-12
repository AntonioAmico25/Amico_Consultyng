from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    tenant_slug: str = Field(min_length=2, max_length=120)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    tenant_id: str
    role: str


class CurrentUser(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    tenant_id: str
    tenant_name: str
    role: str
    sector_code: str | None = None
