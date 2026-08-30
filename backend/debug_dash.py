import urllib.request
import json
import traceback

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
    try:
        d_res = urllib.request.urlopen(d_req)
        data = json.loads(d_res.read())
        print("=== STUDENT DASHBOARD SUCCESS ===")
        print("Today Periods Count:", len(data['today_periods']))
    except urllib.error.HTTPError as e:
        print("=== HTTP ERROR ===")
        print(e.code)
        print(e.read().decode('utf-8'))

if __name__ == "__main__":
    test()
