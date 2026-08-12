from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import CurrentUser

router = APIRouter(prefix="/api/v1", tags=["identity"])


@router.get("/me", response_model=CurrentUser)
async def me(current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    return current
