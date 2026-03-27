from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, Bike
from schemas import BikeCreate, BikeResponse
from typing import List

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CREATE
@app.post("/bikes", response_model=BikeResponse, status_code=201)
def create_bike(bike: BikeCreate, db: Session = Depends(get_db)):
    nueva = Bike(**bike.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

# GET ALL
@app.get("/bikes", response_model=List[BikeResponse], status_code=200)
def get_bikes( db: Session = Depends(get_db)):
    return db.query(Bike).all()
    
# GET by ID 
@app.get("/bikes/{bike_id}", response_model=BikeResponse, status_code=200)
def get_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    return bike
# DELETE
@app.delete("/bikes/{bike_id}", status_code=200)
def delete_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    db.delete(bike)
    db.commit()
    return {"ok": True}
# PUT
@app.put("/bikes/{bike_id}", response_model=BikeResponse, status_code=200)
def put_bike(bike_id: int, bike_data: BikeCreate, db: Session = Depends(get_db)):
    bike = db.get(Bike, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    bike.marca = bike_data.marca
    bike.tipo = bike_data.tipo
    bike.color = bike_data.color
    db.commit()
    db.refresh(bike)
    return bike