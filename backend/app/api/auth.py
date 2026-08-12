from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.identity import Membership, Tenant, User
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    stmt = (
        select(Membership)
        .join(Membership.user)
        .join(Membership.tenant)
        .options(
            selectinload(Membership.user),
            selectinload(Membership.tenant),
            selectinload(Membership.role),
        )
        .where(
            User.email == payload.email.lower(),
            Tenant.slug == payload.tenant_slug,
            User.is_active.is_(True),
            Tenant.is_active.is_(True),
            Membership.is_active.is_(True),
        )
    )
    membership = (await db.execute(stmt)).scalar_one_or_none()
    if membership is None or not verify_password(payload.password, membership.user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        subject=str(membership.user_id),
        tenant_id=str(membership.tenant_id),
        role_code=membership.role.code,
    )
    return TokenResponse(
        access_token=token,
        tenant_id=str(membership.tenant_id),
        role=membership.role.code,
    )
