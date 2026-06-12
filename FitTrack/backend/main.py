from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from routers import users, workouts, nutrition

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(nutrition.router)


@app.on_event("startup")
def create_default_user():
    from models import User
    from auth import get_password_hash
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.id == 1).first():
            user = User(
                id=1,
                nome="Rafael",
                email="rafael@fittrack.local",
                password_hash=get_password_hash("fittrack"),
                peso_kg=75.0,
                altura_cm=178.0,
                idade=22,
                sexo="M",
                nivel_atividade="moderado",
                objetivo="manter",
            )
            db.add(user)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "FitTrack API", "docs": "/docs"}
