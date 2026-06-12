from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from models import User, Refeicao, Alimento
from schemas import RefeicaoCreate, RefeicaoOut, AlimentoCreate, AlimentoOut, DailySummary
from auth import get_current_user, calculate_tdee

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.get("/", response_model=List[RefeicaoOut])
def list_refeicoes(
    data: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Refeicao).filter(Refeicao.utilizador_id == current_user.id)
    if data:
        query = query.filter(Refeicao.data == data)
    return query.order_by(Refeicao.data.desc()).all()


@router.post("/refeicoes", response_model=RefeicaoOut, status_code=201)
def create_refeicao(
    refeicao_data: RefeicaoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    refeicao = Refeicao(
        utilizador_id=current_user.id,
        data=refeicao_data.data or date.today(),
        tipo=refeicao_data.tipo,
    )
    db.add(refeicao)
    db.commit()
    db.refresh(refeicao)
    return refeicao


@router.delete("/refeicoes/{refeicao_id}")
def delete_refeicao(
    refeicao_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    refeicao = db.query(Refeicao).filter(
        Refeicao.id == refeicao_id, Refeicao.utilizador_id == current_user.id
    ).first()
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")
    db.delete(refeicao)
    db.commit()
    return {"message": "Refeição eliminada"}


@router.post("/refeicoes/{refeicao_id}/alimentos", response_model=AlimentoOut, status_code=201)
def add_alimento(
    refeicao_id: int,
    alimento_data: AlimentoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    refeicao = db.query(Refeicao).filter(
        Refeicao.id == refeicao_id, Refeicao.utilizador_id == current_user.id
    ).first()
    if not refeicao:
        raise HTTPException(status_code=404, detail="Refeição não encontrada")

    alimento = Alimento(
        refeicao_id=refeicao_id,
        nome=alimento_data.nome,
        calorias=alimento_data.calorias,
        proteinas_g=alimento_data.proteinas_g,
        hidratos_g=alimento_data.hidratos_g,
        gorduras_g=alimento_data.gorduras_g,
    )
    db.add(alimento)
    db.commit()
    db.refresh(alimento)
    return alimento


@router.delete("/alimentos/{alimento_id}")
def delete_alimento(
    alimento_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alimento = (
        db.query(Alimento)
        .join(Refeicao)
        .filter(Alimento.id == alimento_id, Refeicao.utilizador_id == current_user.id)
        .first()
    )
    if not alimento:
        raise HTTPException(status_code=404, detail="Alimento não encontrado")
    db.delete(alimento)
    db.commit()
    return {"message": "Alimento eliminado"}


@router.get("/summary/today", response_model=DailySummary)
def get_today_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    refeicoes = db.query(Refeicao).filter(
        Refeicao.utilizador_id == current_user.id,
        Refeicao.data == today,
    ).all()

    total_calorias = sum(a.calorias for r in refeicoes for a in r.alimentos)
    total_proteinas = sum(a.proteinas_g for r in refeicoes for a in r.alimentos)
    total_hidratos = sum(a.hidratos_g for r in refeicoes for a in r.alimentos)
    total_gorduras = sum(a.gorduras_g for r in refeicoes for a in r.alimentos)

    tdee_data = calculate_tdee(current_user)
    meta = tdee_data["objetivo_calorico"] if tdee_data else 2000
    projecao = tdee_data["projecao_semanal_kg"] if tdee_data else 0.0

    balanco = total_calorias - meta

    if current_user.objetivo == "perder":
        if balanco < 0:
            mensagem = f"Estás em défice de {abs(balanco):.0f} kcal — no bom caminho para perder peso!"
        else:
            mensagem = f"Excedeste a meta em {balanco:.0f} kcal hoje. Tenta reduzir nas próximas refeições."
    elif current_user.objetivo == "ganhar":
        if balanco >= 0:
            mensagem = f"Estás em excedente de {balanco:.0f} kcal — no bom caminho para ganhar massa!"
        else:
            mensagem = f"Faltam {abs(balanco):.0f} kcal para atingires a meta de hoje."
    else:
        if abs(balanco) <= 100:
            mensagem = "Estás a manter o equilíbrio calórico perfeito!"
        elif balanco < 0:
            mensagem = f"Ainda tens {abs(balanco):.0f} kcal disponíveis para hoje."
        else:
            mensagem = f"Excedeste a meta em {balanco:.0f} kcal hoje."

    return DailySummary(
        data=today,
        total_calorias=round(total_calorias, 1),
        total_proteinas=round(total_proteinas, 1),
        total_hidratos=round(total_hidratos, 1),
        total_gorduras=round(total_gorduras, 1),
        meta_calorica=meta,
        balanco=round(balanco, 1),
        mensagem=mensagem,
        projecao_semanal_kg=projecao,
    )
