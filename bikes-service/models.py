from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum

class TipoBicicleta(str, enum.Enum):
    cross = "Cross"
    mountain = "Mountain bike"
    ruta = "Ruta"

class Bike(Base):
    __tablename__ = "bikes"

    id = Column(Integer, primary_key=True, index=True)
    marca = Column(String, nullable=False)
    tipo = Column(Enum(TipoBicicleta), nullable=False)
    color = Column(String, nullable=False)