from fastapi import FastAPI
from routes.reservations import router as reservations_router
from models import engine, Base

# Create all tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EAFIT Bikes - Reservations Service", version="1.0.0")

# Include routes
app.include_router(reservations_router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "reservations"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

