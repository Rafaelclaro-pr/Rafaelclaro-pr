from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    password: str
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    idade: Optional[int] = None
    sexo: Optional[str] = None
    nivel_atividade: str = "moderado"
    objetivo: str = "manter"


class UserUpdate(BaseModel):
    nome: Optional[str] = None
    peso_kg: Optional[float] = None
    altura_cm: Optional[float] = None
    idade: Optional[int] = None
    sexo: Optional[str] = None
    nivel_atividade: Optional[str] = None
    objetivo: Optional[str] = None


class UserOut(BaseModel):
    id: int
    nome: str
    email: str
    peso_kg: Optional[float]
    altura_cm: Optional[float]
    idade: Optional[int]
    sexo: Optional[str]
    nivel_atividade: str
    objetivo: str
    data_registo: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TDEEResponse(BaseModel):
    tmb: float
    tdee: float
    objetivo_calorico: int
    projecao_semanal_kg: float


class SerieCreate(BaseModel):
    repeticoes: int
    peso_kg: Optional[float] = None


class SerieOut(BaseModel):
    id: int
    repeticoes: int
    peso_kg: Optional[float]

    model_config = {"from_attributes": True}


class ExercicioCreate(BaseModel):
    nome: str
    musculo_trabalhado: Optional[str] = None


class ExercicioOut(BaseModel):
    id: int
    nome: str
    musculo_trabalhado: Optional[str]
    series: List[SerieOut] = []

    model_config = {"from_attributes": True}


class TreinoCreate(BaseModel):
    data: Optional[date] = None
    notas: Optional[str] = None


class TreinoOut(BaseModel):
    id: int
    data: date
    notas: Optional[str]
    exercicios: List[ExercicioOut] = []

    model_config = {"from_attributes": True}


class AlimentoCreate(BaseModel):
    nome: str
    calorias: float
    proteinas_g: float = 0.0
    hidratos_g: float = 0.0
    gorduras_g: float = 0.0


class AlimentoOut(BaseModel):
    id: int
    nome: str
    calorias: float
    proteinas_g: float
    hidratos_g: float
    gorduras_g: float

    model_config = {"from_attributes": True}


class RefeicaoCreate(BaseModel):
    data: Optional[date] = None
    tipo: str


class RefeicaoOut(BaseModel):
    id: int
    data: date
    tipo: str
    alimentos: List[AlimentoOut] = []

    model_config = {"from_attributes": True}


class DailySummary(BaseModel):
    data: date
    total_calorias: float
    total_proteinas: float
    total_hidratos: float
    total_gorduras: float
    meta_calorica: int
    balanco: float
    mensagem: str
    projecao_semanal_kg: float
