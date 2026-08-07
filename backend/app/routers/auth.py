from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models, database, auth, face_engine, crypto

router = APIRouter()

@router.post("/register", response_model=schemas.TokenResponse)
def register(request: schemas.RegisterRequest, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(request.password)
    # Auto approve accounts for demo smooth usage
    is_approved = True
    
    new_user = models.User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hashed_pwd,
        role=request.role,
        phone_number=request.phone_number,
        roll_number=request.roll_number,
        department=request.department,
        year=request.year,
        section=request.section,
        profile_pic=request.profile_pic,
        is_approved=is_approved
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If student provided profile photo during registration, generate & store face embedding vector!
    if request.role == "student" and request.profile_pic:
        try:
            emb_vector = face_engine.extract_face_embedding(request.profile_pic)
            encrypted_emb = crypto.encrypt_embedding(emb_vector)
            face_rec = models.FaceEmbedding(
                student_id=new_user.id,
                encrypted_embedding=encrypted_emb
            )
            db.add(face_rec)
            db.commit()
        except Exception as e:
            print("Notice: Face embedding extraction warning during registration:", str(e))
    
    log = models.AuditLog(user_id=new_user.id, action="USER_REGISTERED", details=f"Role: {request.role}")
    db.add(log)
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    log = models.AuditLog(user_id=user.id, action="USER_LOGIN")
    db.add(log)
    db.commit()
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserSchema)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
