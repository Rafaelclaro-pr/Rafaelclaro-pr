from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserOut, LoginRequest, Token, TDEEResponse
from auth import verify_password, get_password_hash, create_access_token, get_current_user, calculate_tdee

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email já registado")

    user = User(
        nome=user_data.nome,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        peso_kg=user_data.peso_kg,
        altura_cm=user_data.altura_cm,
        idade=user_data.idade,
        sexo=user_data.sexo,
        nivel_atividade=user_data.nivel_atividade,
        objetivo=user_data.objetivo,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou password incorretos")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/tdee", response_model=TDEEResponse)
def get_tdee(current_user: User = Depends(get_current_user)):
    result = calculate_tdee(current_user)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Perfil incompleto. Preenche peso, altura, idade e sexo no perfil.",
        )
    return result
