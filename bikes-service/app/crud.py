from sqlalchemy.orm import Session
from app.models import Bike
from app.schemas import BikeCreate

def create_bike(db: Session, bike: BikeCreate):
    nueva = Bike(**bike.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def get_bikes(db: Session):
    return db.query(Bike).all()

def get_bike(db: Session, bike_id: int):
    return db.get(Bike, bike_id)

def get_bikes_by_ids(db: Session, bike_ids: list[int]):
    return db.query(Bike).filter(Bike.id.in_(bike_ids)).all()

def update_bike(db: Session, bike_id: int, bike_data: BikeCreate):
    bike = db.get(Bike, bike_id)
    if not bike:
        return None
    bike.marca = bike_data.marca
    bike.tipo = bike_data.tipo
    bike.color = bike_data.color
    db.commit()
    db.refresh(bike)
    return bike

def delete_bike(db: Session, bike_id: int):
    bike = db.get(Bike, bike_id)
    if not bike:
        return None
    db.delete(bike)
    db.commit()
    return True