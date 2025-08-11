from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.api.routes import auth as auth_routes
from app.api.routes import properties as properties_routes
from app.api.routes import deals as deals_routes
from app.api.routes import calculations as calc_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Real Estate Investment API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(properties_routes.router)
app.include_router(deals_routes.router)
app.include_router(calc_routes.router)


@app.get("/")
def root():
    return {"status": "ok"}