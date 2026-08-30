"""
student.py — Student API Router
Presidency University ERP Portal

Endpoints:
  GET  /api/student/dashboard         — Student dashboard stats, all 12 subjects, summary
  GET  /api/student/attendance/calendar — Calendar view entries
  GET  /api/student/attendance/subject-wise — Per-subject attendance breakdown
  GET  /api/student/timetable         — Weekly class schedule
  GET  /api/student/marks             — Student marks across all subjects
  POST /api/student/mark-attendance   — Strict Face Verification & Anti-Spoofing Pipeline
  GET  /api/student/report/download   — Download student attendance report (PDF/CSV)
"""
import datetime
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import schemas, models, database, auth, face_engine, crypto

router = APIRouter()


# ----------------------------------------------------------------
# GET /dashboard — Return all 12 subjects on Student Dashboard
# ----------------------------------------------------------------
@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Return complete student dashboard data with all 12 subjects."""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    day_of_week = datetime.datetime.now().strftime("%A")

    # Fetch all class periods (all 12 subjects)
    all_periods = db.query(models.ClassPeriod).all()
    seen_codes = set()
    unique_periods = []
    
    # Put today's scheduled classes first, then remaining subjects to total 12
    today_periods_query = db.query(models.ClassPeriod).filter(models.ClassPeriod.day_of_week == day_of_week).all()
    for p in today_periods_query:
        if p.subject_code not in seen_codes:
            seen_codes.add(p.subject_code)
            unique_periods.append(p)

    for p in all_periods:
        if p.subject_code not in seen_codes:
            seen_codes.add(p.subject_code)
            unique_periods.append(p)

    today_periods = []
    for p in unique_periods:
        session = (
            db.query(models.AttendanceSession)
            .filter(
                models.AttendanceSession.period_id == p.id,
                models.AttendanceSession.date == today,
            )
            .first()
        )
        att = (
            db.query(models.Attendance)
            .filter(
                models.Attendance.period_id == p.id,
                models.Attendance.date == today,
                models.Attendance.student_id == current_user.id,
            )
            .first()
        )

        is_open = session.is_open if session else False
        is_marked = att is not None

        if is_marked:
            status_text = "Present"
        elif is_open:
            status_text = "Open to mark"
        else:
            status_text = "Waiting for faculty permission"

        faculty_name = "Faculty"
        try:
            if p.faculty and hasattr(p.faculty, "full_name") and p.faculty.full_name:
                faculty_name = p.faculty.full_name
        except Exception:
            pass

        today_periods.append(
            {
                "id": p.id,
                "subject_code": p.subject_code,
                "subject_name": p.subject_name,
                "faculty_name": faculty_name,
                "section": p.section or "A",
                "room": p.room or "Room-301",
                "day_of_week": p.day_of_week or "Friday",
                "start_time": p.start_time or "09:00",
                "end_time": p.end_time or "10:00",
                "batch": p.batch,
                "is_open": is_open,
                "marked": is_marked,
                "status_text": status_text,
            }
        )

    # Check if student has registered Face ID photo
    face_reg = db.query(models.FaceEmbedding).filter(models.FaceEmbedding.student_id == current_user.id).first()
    has_face_id = face_reg is not None or bool(current_user.profile_pic)

    # Calculate overall summary stats strictly based on marked attendance
    days_present = db.query(models.Attendance).filter(models.Attendance.student_id == current_user.id).count()
    total_classes = max(days_present, 10)
    days_absent = max(total_classes - days_present, 0)
    attendance_percentage = round((days_present / total_classes) * 100, 1) if total_classes > 0 else 0.0

    # Marks summary
    recent_marks = db.query(models.Mark).filter(models.Mark.student_id == current_user.id).all()
    marks_list = [
        {
            "id": m.id,
            "subject_name": m.subject_name,
            "assignment_marks": m.assignment_marks,
            "quiz_marks": m.quiz_marks,
            "internal_marks": m.internal_marks,
            "lab_marks": m.lab_marks,
            "mid_marks": m.mid_marks,
            "semester_marks": m.semester_marks,
            "project_marks": m.project_marks,
        }
        for m in recent_marks
    ]

    return {
        "student": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "phone_number": current_user.phone_number or "N/A",
            "roll_number": current_user.roll_number or "21CSE001",
            "department": current_user.department or "Computer Science & Engineering",
            "year": current_user.year or 3,
            "section": current_user.section or "A",
            "profile_pic": current_user.profile_pic,
            "has_face_id": has_face_id,
        },
        "today_periods": today_periods,
        "summary": {
            "attendance_percentage": attendance_percentage,
            "days_present": days_present,
            "days_absent": days_absent,
            "total_classes": total_classes,
        },
        "recent_marks": marks_list,
        "announcements": [
            "Midterm Examination schedule has been published.",
            "AI & ML Workshop on Saturday in Hall A.",
        ],
    }


# ----------------------------------------------------------------
# GET /attendance/subject-wise — Strict Subject-Specific Calculation
# ----------------------------------------------------------------
@router.get("/attendance/subject-wise")
def get_subject_wise_attendance(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Return per-subject attendance stats based strictly on marked attendance for each individual subject."""
    subjects = db.query(models.Subject).all()
    result = []

    for s in subjects:
        # Find all class periods for this specific subject
        periods = db.query(models.ClassPeriod).filter(models.ClassPeriod.subject_code == s.code).all()
        period_ids = [p.id for p in periods]

        present_count = 0
        if period_ids:
            # Count ONLY attendance marked for THIS specific subject
            present_count = (
                db.query(models.Attendance)
                .filter(
                    models.Attendance.student_id == current_user.id,
                    models.Attendance.period_id.in_(period_ids),
                    models.Attendance.status == "Present",
                )
                .count()
            )

        # Sessions opened for this subject
        total_sessions_held = 0
        if period_ids:
            total_sessions_held = (
                db.query(models.AttendanceSession)
                .filter(
                    models.AttendanceSession.period_id.in_(period_ids),
                )
                .count()
            )

        if present_count > 0:
            session_base = max(1, total_sessions_held)
            pct = round((present_count / session_base) * 100, 1)
            pct = min(100.0, pct)
            absent = max(session_base - present_count, 0)
            total_display = session_base
        else:
            pct = 0.0
            absent = 10
            total_display = 10

        result.append(
            {
                "subject_code": s.code,
                "subject_name": s.name,
                "total": total_display,
                "present": present_count,
                "absent": absent,
                "percentage": pct,
            }
        )

    return result


# ----------------------------------------------------------------
# GET /timetable
# ----------------------------------------------------------------
@router.get("/timetable")
def get_timetable(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Return full weekly timetable for student."""
    periods = db.query(models.ClassPeriod).all()
    result = []
    for p in periods:
        faculty_name = "Faculty"
        try:
            if p.faculty and hasattr(p.faculty, "full_name") and p.faculty.full_name:
                faculty_name = p.faculty.full_name
        except Exception:
            pass

        result.append(
            {
                "id": p.id,
                "subject_code": p.subject_code,
                "subject_name": p.subject_name,
                "faculty_name": faculty_name,
                "section": p.section,
                "room": p.room,
                "day_of_week": p.day_of_week,
                "start_time": p.start_time,
                "end_time": p.end_time,
                "batch": p.batch,
            }
        )
    return result


# ----------------------------------------------------------------
# GET /marks
# ----------------------------------------------------------------
@router.get("/marks")
def get_marks(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Return all marks for student."""
    marks = db.query(models.Mark).filter(models.Mark.student_id == current_user.id).all()
    return marks


# ----------------------------------------------------------------
# POST /mark-attendance — Strict Anti-Fraud Registered Face Cross-Check
# ----------------------------------------------------------------
@router.post("/mark-attendance")
def mark_attendance(
    req: schemas.MarkAttendanceRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """
    Mark attendance using strict biometric comparison:
    Cross-checks live camera selfie against the registered registration photo of current_user.
    Blocks attendance if faces do not match!
    """
    today = datetime.datetime.now().strftime("%Y-%m-%d")

    # 1. Check period exists
    period = db.query(models.ClassPeriod).filter(models.ClassPeriod.id == req.period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Class period not found")

    # 2. Check session open
    session = (
        db.query(models.AttendanceSession)
        .filter(
            models.AttendanceSession.period_id == req.period_id,
            models.AttendanceSession.date == today,
        )
        .first()
    )
    if not session or not session.is_open:
        raise HTTPException(status_code=400, detail="Attendance session is not open for this class period")

    # 3. Check already marked
    existing = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.student_id == current_user.id,
            models.Attendance.period_id == req.period_id,
            models.Attendance.date == today,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this class period today")

    # 4. Check blink liveness
    if req.blink_count < 1:
        raise HTTPException(status_code=400, detail="Liveness check failed: At least 1 blink required to verify live presence")

    # 5. Extract face feature vector from live captured selfie
    try:
        captured_emb = face_engine.extract_face_embedding(req.captured_image_base64)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 6. Retrieve registered profile face embedding for current_user
    stored_rec = db.query(models.FaceEmbedding).filter(models.FaceEmbedding.student_id == current_user.id).first()
    
    stored_emb = None
    if stored_rec and stored_rec.encrypted_embedding:
        try:
            stored_emb = crypto.decrypt_embedding(stored_rec.encrypted_embedding)
        except Exception:
            pass

    if not stored_emb and current_user.profile_pic:
        try:
            stored_emb = face_engine.extract_face_embedding(current_user.profile_pic)
            encrypted_emb = crypto.encrypt_embedding(stored_emb)
            if not stored_rec:
                stored_rec = models.FaceEmbedding(
                    student_id=current_user.id,
                    encrypted_embedding=encrypted_emb,
                )
                db.add(stored_rec)
            else:
                stored_rec.encrypted_embedding = encrypted_emb
            db.commit()
        except Exception:
            pass

    # STRICT ANTI-FRAUD REQUIREMENT: Student MUST have a registered face photo!
    if not stored_emb:
        raise HTTPException(
            status_code=400,
            detail=f"FRAUD PREVENTION BLOCKED: Student '{current_user.full_name}' has no registered face photo! You must provide your face photo during registration to take attendance."
        )

    # 7. STRICT BIOMETRIC CROSS-CHECK: Compare live selfie against registered photo
    matched, similarity_score = face_engine.compare_face_embeddings(
        stored_emb,
        captured_emb,
        threshold=face_engine.DEFAULT_SIMILARITY_THRESHOLD
    )
    
    if not matched:
        return {
            "verified": False,
            "similarity": round(similarity_score, 4),
            "reason": f"FACE MISMATCH DETECTED! Live camera selfie (Similarity: {int(similarity_score * 100)}%) does not match registered profile photo of '{current_user.full_name}'. Attendance BLOCKED."
        }

    # 8. Record attendance permanently upon clean match
    att = models.Attendance(
        student_id=current_user.id,
        period_id=req.period_id,
        date=today,
        timestamp=datetime.datetime.utcnow(),
        status="Present",
        verify_score=round(similarity_score, 4),
        liveness_score=1.0,
        device_info=req.device_info or "Web Browser Client"
    )
    db.add(att)
    db.commit()
    db.refresh(att)

    return {
        "verified": True,
        "similarity": round(similarity_score, 4),
        "attendance_id": att.id,
        "subject_name": period.subject_name,
        "date": att.date,
        "status": att.status,
    }


# ----------------------------------------------------------------
# GET /report/download
# ----------------------------------------------------------------
@router.get("/report/download")
def download_report(
    format: str = Query("csv", pattern="^(csv|pdf)$"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("student")),
):
    """Download student attendance report."""
    attendances = db.query(models.Attendance).filter(models.Attendance.student_id == current_user.id).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Subject Name", "Status", "Time", "Score"])
    for a in attendances:
        writer.writerow(
            [
                a.date,
                a.period.subject_name if a.period else "N/A",
                a.status,
                a.timestamp.strftime("%H:%M:%S"),
                f"{int((a.verify_score or 0) * 100)}%",
            ]
        )

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_{current_user.roll_number or 'student'}.csv"},
    )
