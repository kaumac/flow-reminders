import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add the apps/api directory to sys.path to import src
sys.path.append(os.path.join(os.path.dirname(__file__)))

from src.services.vapi import make_reminder_call

def test_call():
    # Instructions for the user:
    # Set VAPI_API_KEY and VAPI_PHONE_NUMBER_ID in your environment
    # and provide a test phone number below.
    
    test_number = os.getenv("TEST_PHONE_NUMBER")
    if not test_number:
        print("Please set TEST_PHONE_NUMBER environment variable (e.g., +1234567890)")
        return

    print(f"Triggering test call to {test_number}...")
    call = make_reminder_call(
        phone_number=test_number,
        title="Verification Test",
        description="This is a test call to verify the Vapi integration."
    )
    
    if call:
        print(f"Success! Call ID: {getattr(call, 'id', 'initiated')}")
    else:
        print("Failure to initiate call. Check logs and environment variables.")

if __name__ == "__main__":
    test_call()
