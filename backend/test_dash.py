import urllib.request
import json

def test():
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login',
        data=json.dumps({'email':'student@presidency.edu','password':'student123'}).encode('utf-8'),
        headers={'Content-Type':'application/json'}
    )
    res = urllib.request.urlopen(req)
    token = json.loads(res.read())['access_token']

    # Student Dashboard
    d_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/student/dashboard',
        headers={'Authorization': f'Bearer {token}'}
    )
    d_res = urllib.request.urlopen(d_req)
    data = json.loads(d_res.read())
    print("=== STUDENT DASHBOARD ===")
    print("Student Name:", data['student']['full_name'])
    print("Student Photo Present:", bool(data['student']['profile_pic']))
    print("Total Today Periods Count:", len(data['today_periods']))
    for p in data['today_periods']:
        print(f"  - [{p['subject_code']}] {p['subject_name']} (Faculty: {p['faculty_name']}, Status: {p['status_text']})")

    # Faculty Dashboard
    f_login = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login',
        data=json.dumps({'email':'jinesh@presidency.edu','password':'faculty123'}).encode('utf-8'),
        headers={'Content-Type':'application/json'}
    )
    f_res = urllib.request.urlopen(f_login)
    ftoken = json.loads(f_res.read())['access_token']

    f_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/faculty/dashboard',
        headers={'Authorization': f'Bearer {ftoken}'}
    )
    f_dash = json.loads(urllib.request.urlopen(f_req).read())
    print("\n=== FACULTY DASHBOARD ===")
    print("Faculty Name:", f_dash['faculty']['full_name'])
    print("Total Classes Count:", len(f_dash['today_classes']))
    for c in f_dash['today_classes']:
        print(f"  - [{c['subject_code']}] {c['subject_name']} (IsOpen: {c['is_open']})")

if __name__ == "__main__":
    test()
