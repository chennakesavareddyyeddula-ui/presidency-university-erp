import base64
import os

img_path = r"C:\Users\chenn\.gemini\antigravity\brain\e1700240-5510-4db9-934b-aae0ef07bbca\student_profile_photo_1786122412074.jpg"
out_path = r"d:\PROJECTS\New folder\backend\app\student_photo.py"

if os.path.exists(img_path):
    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    with open(out_path, "w") as f:
        f.write(f'STUDENT_PHOTO_BASE64 = "data:image/jpeg;base64,{b64}"\n')
    print("Successfully created student_photo.py!")
else:
    print("Image not found at path")
