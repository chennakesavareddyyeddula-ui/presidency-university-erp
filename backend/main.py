from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app import models
from app.routers import auth, student, faculty, admin
from app.seed import seed_initial_data

app = FastAPI(title="Presidency University ERP Portal Attendance")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "running", "app": "Presidency University ERP"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(faculty.router, prefix="/api/faculty", tags=["faculty"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
