import traceback
from app.database import SessionLocal
from app import models
from app.routers import student

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == "student@presidency.edu").first()

try:
    res = student.get_dashboard(db=db, current_user=user)
    print("SUCCESS! Today Periods Count:", len(res["today_periods"]))
    for p in res["today_periods"]:
        print(f"  - [{p['subject_code']}] {p['subject_name']} (Status: {p['status_text']})")
except Exception as e:
    print("ERROR IN GET_DASHBOARD:")
    traceback.print_exc()
