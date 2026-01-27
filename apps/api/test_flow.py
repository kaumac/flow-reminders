import requests
import time
from datetime import datetime, timedelta

API_URL = "http://localhost:8000"

def test_reminder_flow():
    # 1. Sign in or get session (assuming user exists or using a specific phone)
    phone_number = "+5511999999999" # Use a test number
    signin_resp = requests.post(f"{API_URL}/signin", json={"phone_number": phone_number})
    signin_data = signin_resp.json()
    token = signin_data["session_token"]
    cookies = {"session_token": token}

    # 2. Create a reminder scheduled for 10 seconds from now
    scheduled_time = (datetime.now() + timedelta(seconds=10)).isoformat()
    
    reminder_data = {
        "title": "Test End-to-End Reminder",
        "description": "This is a test of the automatic call flow.",
        "scheduled_time": scheduled_time
    }
    
    print(f"Creating reminder for {scheduled_time}...")
    create_resp = requests.post(f"{API_URL}/reminders", json=reminder_data, cookies=cookies)
    if create_resp.status_code != 200:
        print(f"Failed to create reminder: {create_resp.text}")
        return
    
    reminder = create_resp.json()
    reminder_id = reminder["id"]
    print(f"Reminder created with ID: {reminder_id}, status: {reminder['status']}")

    # 3. Wait and check status
    print("Waiting for job execution (20 seconds)...")
    time.sleep(20)
    
    list_resp = requests.get(f"{API_URL}/reminders", cookies=cookies)
    reminders = list_resp.json()
    
    found = False
    for r in reminders:
        if r["id"] == reminder_id:
            print(f"Found reminder. Final status: {r['status']}")
            found = True
            break
    
    if not found:
        print("Reminder not found in list!")

if __name__ == "__main__":
    test_reminder_flow()
