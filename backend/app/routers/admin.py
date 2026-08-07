from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app import schemas, models, database, auth
import csv
from io import StringIO

router = APIRouter()

@router.get("/students")
def list_students(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    return db.query(models.User).filter(models.User.role == "student").all()

@router.get("/faculty")
def list_faculty(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    return db.query(models.User).filter(models.User.role == "faculty").all()

@router.get("/attendance")
def all_attendance(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    return db.query(models.Attendance).limit(1000).all()

@router.post("/approve/{user_id}")
def approve_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.is_approved = True
        db.commit()
        return {"message": "User approved"}
    return {"error": "User not found"}

@router.get("/export/csv")
def export_csv(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.require_role("admin"))):
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Student", "Subject", "Status"])
    atts = db.query(models.Attendance).all()
    for a in atts:
        writer.writerow([a.date, a.student.full_name if a.student else "N/A", a.period.subject_name if a.period else "N/A", a.status])
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=all_attendance.csv"})
