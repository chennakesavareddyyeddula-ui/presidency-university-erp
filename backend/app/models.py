import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # student/faculty/admin
    phone_number = Column(String, nullable=True)
    roll_number = Column(String, unique=True, nullable=True)
    department = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    profile_pic = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    face_embedding = relationship("FaceEmbedding", back_populates="user", uselist=False)
    attendances = relationship("Attendance", back_populates="student")
    marks = relationship("Mark", back_populates="student")
    faculty_periods = relationship("ClassPeriod", back_populates="faculty")


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), unique=True)
    encrypted_embedding = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="face_embedding")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    faculty_name = Column(String)
    credits = Column(Integer)
    semester = Column(Integer, default=7)


class ClassPeriod(Base):
    __tablename__ = "class_periods"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    subject_code = Column(String)
    subject_name = Column(String)
    section = Column(String)
    room = Column(String)
    day_of_week = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    faculty_id = Column(Integer, ForeignKey("users.id"))
    batch = Column(String, nullable=True)

    faculty = relationship("User", back_populates="faculty_periods")
    sessions = relationship("AttendanceSession", back_populates="period")
    attendances = relationship("Attendance", back_populates="period")


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)
    period_id = Column(Integer, ForeignKey("class_periods.id"))
    date = Column(String) # YYYY-MM-DD
    faculty_id = Column(Integer, ForeignKey("users.id"))
    is_open = Column(Boolean, default=False)
    opened_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint('period_id', 'date', name='_period_date_uc'),)

    period = relationship("ClassPeriod", back_populates="sessions")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    period_id = Column(Integer, ForeignKey("class_periods.id"))
    date = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default='Present')
    verify_score = Column(Float, default=1.0)
    liveness_score = Column(Float, default=1.0)
    device_info = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint('student_id', 'period_id', 'date', name='_student_period_date_uc'),)

    student = relationship("User", back_populates="attendances")
    period = relationship("ClassPeriod", back_populates="attendances")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_name = Column(String)
    assignment_marks = Column(Float, default=0)
    quiz_marks = Column(Float, default=0)
    internal_marks = Column(Float, default=0)
    lab_marks = Column(Float, default=0)
    mid_marks = Column(Float, default=0)
    semester_marks = Column(Float, default=0)
    project_marks = Column(Float, default=0)

    __table_args__ = (UniqueConstraint('student_id', 'subject_name', name='_student_subject_uc'),)

    student = relationship("User", back_populates="marks")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
