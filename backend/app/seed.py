from sqlalchemy.orm import Session
from app import models, auth

def seed_initial_data(db: Session):
    # Check if admin exists to make idempotent
    admin = db.query(models.User).filter(models.User.email == "admin@presidency.edu").first()
    if admin:
        return # Seed already ran

    # 1. Admin
    admin_user = models.User(
        full_name="Admin",
        email="admin@presidency.edu",
        password_hash=auth.get_password_hash("admin123"),
        role="admin",
        is_approved=True
    )
    db.add(admin_user)

    # 2. Faculty Accounts
    faculty_data = [
        {"name": "Jinesh V N", "email": "jinesh@presidency.edu", "subject_code": "TOC601", "subject_name": "Theory of Computation"},
        {"name": "Asif Ahmad Najar", "email": "asif@presidency.edu", "subject_code": "DA602", "subject_name": "Data Analytics"},
        {"name": "Praveena K N", "email": "praveena@presidency.edu", "subject_code": "MLT603", "subject_name": "Machine Learning Techniques"},
        {"name": "Mahesh D", "email": "mahesh@presidency.edu", "subject_code": "MLL604", "subject_name": "Machine Learning Lab"},
        {"name": "Pallavi R", "email": "pallavi@presidency.edu", "subject_code": "SDD605", "subject_name": "Software Design and Development"},
        {"name": "Mohd Shahilyar", "email": "shahilyar@presidency.edu", "subject_code": "NNFL606", "subject_name": "Neural Networks and Fuzzy Logic"},
        {"name": "Pathan Tasneem Farhana", "email": "tasneem@presidency.edu", "subject_code": "CNS607", "subject_name": "Cryptography and Network Security"},
        {"name": "Neha Seirani Biju", "email": "neha@presidency.edu", "subject_code": "FBT608", "subject_name": "Foundations of Blockchain Technology"},
        {"name": "Shiddalinga Sooragond", "email": "shiddalinga@presidency.edu", "subject_code": "LCT609", "subject_name": "Logical and Critical Thinking"},
        {"name": "Anand Prakash", "email": "anand@presidency.edu", "subject_code": "QCA611", "subject_name": "Quantum Computing and AI"},
        {"name": "UHV Staff", "email": "uhv@presidency.edu", "subject_code": "UHV610", "subject_name": "Universal Human Values and Ethics"},
        {"name": "Intern Staff", "email": "intern@presidency.edu", "subject_code": "INT612", "subject_name": "Internship"}
    ]

    faculty_users = {}
    for fd in faculty_data:
        f = models.User(
            full_name=fd["name"],
            email=fd["email"],
            password_hash=auth.get_password_hash("faculty123"),
            role="faculty",
            is_approved=True
        )
        db.add(f)
        db.flush()
        faculty_users[fd["subject_code"]] = f

    # 3. Subjects
    for fd in faculty_data:
        s = models.Subject(
            code=fd["subject_code"],
            name=fd["subject_name"],
            faculty_name=fd["name"],
            credits=3,
            semester=7
        )
        db.add(s)
        
    # 4. Class Periods for Section A
    timetable = [
        # Monday
        ("Monday", "TOC601", "09:00", "10:00", "Room-301"),
        ("Monday", "DA602", "10:00", "11:00", "Room-302"),
        ("Monday", "MLT603", "11:15", "12:15", "Room-303"),
        ("Monday", "NNFL606", "14:00", "15:00", "Room-304"),
        # Tuesday
        ("Tuesday", "SDD605", "09:00", "10:00", "Room-301"),
        ("Tuesday", "MLL604", "10:00", "12:00", "Lab-101"),
        ("Tuesday", "CNS607", "14:00", "15:00", "Room-302"),
        # Wednesday
        ("Wednesday", "TOC601", "09:00", "10:00", "Room-301"),
        ("Wednesday", "QCA611", "10:00", "11:00", "Room-305"),
        ("Wednesday", "LCT609", "11:15", "12:15", "Room-306"),
        ("Wednesday", "FBT608", "14:00", "15:00", "Room-302"),
        # Thursday
        ("Thursday", "DA602", "09:00", "10:00", "Room-303"),
        ("Thursday", "MLT603", "10:00", "11:00", "Room-301"),
        ("Thursday", "UHV610", "11:15", "12:15", "Room-304"),
        ("Thursday", "SDD605", "14:00", "15:00", "Room-302"),
        # Friday
        ("Friday", "CNS607", "09:00", "10:00", "Room-301"),
        ("Friday", "NNFL606", "10:00", "11:00", "Room-303"),
        ("Friday", "FBT608", "11:15", "12:15", "Room-302"),
        ("Friday", "QCA611", "14:00", "15:00", "Room-305"),
        # Saturday
        ("Saturday", "MLL604", "09:00", "11:00", "Lab-101"),
        ("Saturday", "LCT609", "11:00", "12:00", "Room-306")
    ]
    
    db.flush()
    subjects = {s.code: s for s in db.query(models.Subject).all()}
    
    for day, code, start, end, room in timetable:
        p = models.ClassPeriod(
            subject_id=subjects[code].id,
            subject_code=code,
            subject_name=subjects[code].name,
            section="A",
            room=room,
            day_of_week=day,
            start_time=start,
            end_time=end,
            faculty_id=faculty_users[code].id
        )
        db.add(p)

    # 5. Demo Student
    student = models.User(
        full_name="Rahul Sharma",
        email="student@presidency.edu",
        password_hash=auth.get_password_hash("student123"),
        role="student",
        roll_number="21CSE001",
        department="Computer Science & Engineering",
        year=3,
        section="A",
        is_approved=True
    )
    db.add(student)
    db.flush()

    # 6. Seed Marks
    import random
    for code, subj in subjects.items():
        m = models.Mark(
            student_id=student.id,
            subject_name=subj.name,
            assignment_marks=random.uniform(7, 10),
            quiz_marks=random.uniform(7, 10),
            internal_marks=random.uniform(20, 30),
            lab_marks=random.uniform(15, 20) if "Lab" in subj.name else 0,
            mid_marks=random.uniform(35, 50),
            semester_marks=random.uniform(75, 95),
            project_marks=random.uniform(8, 10)
        )
        db.add(m)

    db.commit()
