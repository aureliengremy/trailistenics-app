from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bloc
from app.schemas import BlocOut

router = APIRouter(prefix="/api/blocs", tags=["blocs"])


@router.get("", response_model=list[BlocOut], summary="Liste des blocs d'entraînement")
def list_blocs(db: Session = Depends(get_db)) -> list[Bloc]:
    return list(db.scalars(select(Bloc).order_by(Bloc.order)))
