from pydantic import BaseModel
from app.models import TipoBicicleta

class BikeCreate(BaseModel):
    marca: str
    tipo: TipoBicicleta
    color: str

class BikeResponse(BikeCreate):
    id: int
    class Config:
        from_attributes = True