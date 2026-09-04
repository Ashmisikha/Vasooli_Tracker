from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.crud.user import get_user_by_username
from app.models.user import User
from app.core.security import get_password_hash

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def get_or_create_user(db: AsyncSession, username: str) -> User:
    user = await get_user_by_username(db, username=username)
    if not user:
        user = User(
            username=username,
            email=f"{username}@example.com",
            password_hash=get_password_hash("demo_password_123")
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            user = await get_user_by_username(db, username=username)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
    return user

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    username = "demo"
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            extracted_username = payload.get("sub")
            if extracted_username:
                username = extracted_username
        except JWTError:
            username = "demo"
    
    return await get_or_create_user(db, username=username)

