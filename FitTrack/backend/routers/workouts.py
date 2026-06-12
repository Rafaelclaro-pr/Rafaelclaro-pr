from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from database import get_db
from models import User, Treino, Exercicio, Serie
from schemas import TreinoCreate, TreinoOut, ExercicioCreate, ExercicioOut, SerieCreate, SerieOut
from auth import get_current_user

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.get("/", response_model=List[TreinoOut])
def list_workouts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Treino)
        .filter(Treino.utilizador_id == current_user.id)
        .order_by(Treino.data.desc())
        .all()
    )


@router.post("/", response_model=TreinoOut, status_code=201)
def create_workout(
    treino_data: TreinoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    treino = Treino(
        utilizador_id=current_user.id,
        data=treino_data.data or date.today(),
        notas=treino_data.notas,
    )
    db.add(treino)
    db.commit()
    db.refresh(treino)
    return treino


@router.get("/{treino_id}", response_model=TreinoOut)
def get_workout(
    treino_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    treino = db.query(Treino).filter(
        Treino.id == treino_id, Treino.utilizador_id == current_user.id
    ).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return treino


@router.delete("/{treino_id}")
def delete_workout(
    treino_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    treino = db.query(Treino).filter(
        Treino.id == treino_id, Treino.utilizador_id == current_user.id
    ).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    db.delete(treino)
    db.commit()
    return {"message": "Treino eliminado"}


@router.post("/{treino_id}/exercicios", response_model=ExercicioOut, status_code=201)
def add_exercicio(
    treino_id: int,
    exercicio_data: ExercicioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    treino = db.query(Treino).filter(
        Treino.id == treino_id, Treino.utilizador_id == current_user.id
    ).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")

    exercicio = Exercicio(
        treino_id=treino_id,
        nome=exercicio_data.nome,
        musculo_trabalhado=exercicio_data.musculo_trabalhado,
    )
    db.add(exercicio)
    db.commit()
    db.refresh(exercicio)
    return exercicio


@router.delete("/exercicios/{exercicio_id}")
def delete_exercicio(
    exercicio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exercicio = (
        db.query(Exercicio)
        .join(Treino)
        .filter(Exercicio.id == exercicio_id, Treino.utilizador_id == current_user.id)
        .first()
    )
    if not exercicio:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    db.delete(exercicio)
    db.commit()
    return {"message": "Exercício eliminado"}


@router.post("/exercicios/{exercicio_id}/series", response_model=SerieOut, status_code=201)
def add_serie(
    exercicio_id: int,
    serie_data: SerieCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exercicio = (
        db.query(Exercicio)
        .join(Treino)
        .filter(Exercicio.id == exercicio_id, Treino.utilizador_id == current_user.id)
        .first()
    )
    if not exercicio:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")

    serie = Serie(
        exercicio_id=exercicio_id,
        repeticoes=serie_data.repeticoes,
        peso_kg=serie_data.peso_kg,
    )
    db.add(serie)
    db.commit()
    db.refresh(serie)
    return serie


@router.delete("/series/{serie_id}")
def delete_serie(
    serie_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    serie = (
        db.query(Serie)
        .join(Exercicio)
        .join(Treino)
        .filter(Serie.id == serie_id, Treino.utilizador_id == current_user.id)
        .first()
    )
    if not serie:
        raise HTTPException(status_code=404, detail="Série não encontrada")
    db.delete(serie)
    db.commit()
    return {"message": "Série eliminada"}
