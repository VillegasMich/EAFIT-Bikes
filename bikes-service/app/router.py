from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Bike
from app.schemas import BikeCreate, BikeResponse
from app import crud
from app import publisher

router = APIRouter()

# CREATE
@router.post("/bikes", response_model=BikeResponse, status_code=201)
def create_bike(bike: BikeCreate, db: Session = Depends(get_db)):
    nueva = crud.create_bike(db, bike)
    publisher.publish_event("bike_created", nueva.id)
    return nueva

# GET ALL
@router.get("/bikes", response_model=List[BikeResponse])
def get_bikes(db: Session = Depends(get_db)):
    return crud.get_bikes(db)

# GET by IDs
@router.get("/bikes/by-ids", response_model=List[BikeResponse])
def get_bikes_by_ids(bike_ids: List[int] = Query(...), db: Session = Depends(get_db)):
    bikes = crud.get_bikes_by_ids(db, bike_ids)
    if not bikes:
        raise HTTPException(status_code=404, detail="No se encontraron bicicletas")
    return bikes
    
# GET by ID 
@router.get("/bikes/{bike_id}", response_model=BikeResponse)
def get_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = crud.get_bike(db, bike_id)
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    return bike

# DELETE
@router.delete("/bikes/{bike_id}", status_code=200)
def delete_bike(bike_id: int, db: Session = Depends(get_db)):
    result = crud.delete_bike(db, bike_id)
    if not result:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    publisher.publish_event("bike_deleted", bike_id)
    return {"ok": True}

# PUT
@router.put("/bikes/{bike_id}", response_model=BikeResponse, status_code=200)
def put_bike(bike_id: int, bike_data: BikeCreate, db: Session = Depends(get_db)):
    bike = crud.update_bike(db, bike_id, bike_data)
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    return bike