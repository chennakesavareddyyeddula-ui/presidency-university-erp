from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    phone_number: str
    roll_number: Optional[str] = None
    department: Optional[str] = 'Computer Science'
    year: Optional[int] = 3
    section: Optional[str] = 'A'
    profile_pic: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserSchema(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    phone_number: Optional[str] = None
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    profile_pic: Optional[str] = None
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserSchema

class SessionToggleRequest(BaseModel):
    period_id: int
    open_state: bool

class MarkAttendanceRequest(BaseModel):
    period_id: int
    captured_image_base64: str
    blink_count: int

class ClassroomAttendanceRequest(BaseModel):
    period_id: int
    classroom_image_base64: str

class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    period_id: int
    subject_name: str
    date: str
    timestamp: datetime
    status: str
    verify_score: float

    class Config:
        from_attributes = True

class MarkEntryRequest(BaseModel):
    student_id: int
    subject_name: str
    assignment_marks: float = 0
    quiz_marks: float = 0
    internal_marks: float = 0
    lab_marks: float = 0
    mid_marks: float = 0
    semester_marks: float = 0
    project_marks: float = 0
