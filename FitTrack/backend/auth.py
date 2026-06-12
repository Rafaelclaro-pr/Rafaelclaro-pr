from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt as _bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from database import get_db
from models import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_password_hash(password: str) -> str:
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def calculate_tdee(user: User) -> Optional[dict]:
    if not all([user.peso_kg, user.altura_cm, user.idade, user.sexo]):
        return None

    if user.sexo == "M":
        tmb = (10 * user.peso_kg) + (6.25 * user.altura_cm) - (5 * user.idade) + 5
    else:
        tmb = (10 * user.peso_kg) + (6.25 * user.altura_cm) - (5 * user.idade) - 161

    fatores = {
        "sedentario": 1.2,
        "leve": 1.375,
        "moderado": 1.55,
        "ativo": 1.725,
        "muito_ativo": 1.9,
    }
    fator = fatores.get(user.nivel_atividade, 1.55)
    tdee = tmb * fator

    ajustes = {"perder": -400, "manter": 0, "ganhar": 250}
    ajuste = ajustes.get(user.objetivo, 0)
    objetivo_calorico = int(tdee + ajuste)

    projecao = (ajuste * 7) / 7700

    return {
        "tmb": round(tmb, 1),
        "tdee": round(tdee, 1),
        "objetivo_calorico": objetivo_calorico,
        "projecao_semanal_kg": round(projecao, 3),
    }
