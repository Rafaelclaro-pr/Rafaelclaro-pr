from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, date
from database import Base


class User(Base):
    __tablename__ = "utilizadores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    peso_kg = Column(Float, nullable=True)
    altura_cm = Column(Float, nullable=True)
    idade = Column(Integer, nullable=True)
    sexo = Column(String(1), nullable=True)
    nivel_atividade = Column(String, default="moderado")
    objetivo = Column(String, default="manter")
    data_registo = Column(DateTime, default=datetime.utcnow)

    treinos = relationship("Treino", back_populates="utilizador", cascade="all, delete-orphan")
    refeicoes = relationship("Refeicao", back_populates="utilizador", cascade="all, delete-orphan")


class Treino(Base):
    __tablename__ = "treinos"

    id = Column(Integer, primary_key=True, index=True)
    utilizador_id = Column(Integer, ForeignKey("utilizadores.id"), nullable=False)
    data = Column(Date, default=date.today)
    notas = Column(String, nullable=True)

    utilizador = relationship("User", back_populates="treinos")
    exercicios = relationship("Exercicio", back_populates="treino", cascade="all, delete-orphan")


class Exercicio(Base):
    __tablename__ = "exercicios"

    id = Column(Integer, primary_key=True, index=True)
    treino_id = Column(Integer, ForeignKey("treinos.id"), nullable=False)
    nome = Column(String, nullable=False)
    musculo_trabalhado = Column(String, nullable=True)

    treino = relationship("Treino", back_populates="exercicios")
    series = relationship("Serie", back_populates="exercicio", cascade="all, delete-orphan")


class Serie(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"), nullable=False)
    repeticoes = Column(Integer, nullable=False)
    peso_kg = Column(Float, nullable=True)

    exercicio = relationship("Exercicio", back_populates="series")


class Refeicao(Base):
    __tablename__ = "refeicoes"

    id = Column(Integer, primary_key=True, index=True)
    utilizador_id = Column(Integer, ForeignKey("utilizadores.id"), nullable=False)
    data = Column(Date, default=date.today)
    tipo = Column(String, nullable=False)

    utilizador = relationship("User", back_populates="refeicoes")
    alimentos = relationship("Alimento", back_populates="refeicao", cascade="all, delete-orphan")


class Alimento(Base):
    __tablename__ = "alimentos"

    id = Column(Integer, primary_key=True, index=True)
    refeicao_id = Column(Integer, ForeignKey("refeicoes.id"), nullable=False)
    nome = Column(String, nullable=False)
    calorias = Column(Float, nullable=False)
    proteinas_g = Column(Float, default=0.0)
    hidratos_g = Column(Float, default=0.0)
    gorduras_g = Column(Float, default=0.0)

    refeicao = relationship("Refeicao", back_populates="alimentos")
