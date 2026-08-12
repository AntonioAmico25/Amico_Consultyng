import uuid

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.identity import Membership
from app.schemas.auth import CurrentUser

bearer = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    x_tenant_id: str | None = Header(default=None, alias="X-Tenant-ID"),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    try:
        claims = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(claims["sub"])
        tenant_id = uuid.UUID(claims["tenant_id"])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    if x_tenant_id and x_tenant_id != str(tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant divergente")

    stmt = (
        select(Membership)
        .options(
            selectinload(Membership.user),
            selectinload(Membership.tenant),
            selectinload(Membership.role),
        )
        .where(
            Membership.user_id == user_id,
            Membership.tenant_id == tenant_id,
            Membership.is_active.is_(True),
        )
    )
    membership = (await db.execute(stmt)).scalar_one_or_none()
    if membership is None or not membership.user.is_active or not membership.tenant.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso inativo")

    return CurrentUser(
        user_id=str(membership.user_id),
        email=membership.user.email,
        full_name=membership.user.full_name,
        tenant_id=str(membership.tenant_id),
        tenant_name=membership.tenant.name,
        role=membership.role.code,
        sector_code=membership.sector_code,
    )


def require_roles(*allowed_roles: str):
    async def dependency(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")
        return current

    return dependency
