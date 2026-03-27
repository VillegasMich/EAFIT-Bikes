from fastapi import FastAPI
from app.database import engine
from app.models import Base
from app.router import router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router)