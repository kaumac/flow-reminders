import os
from vapi import Vapi

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_PHONE_NUMBER_ID = os.getenv("VAPI_PHONE_NUMBER_ID")

client = Vapi(token=VAPI_API_KEY)

def make_reminder_call(phone_number: str, title: str, description: str):
    """
    Triggers an outbound call using Vapi with a system prompt override.
    """
    if not VAPI_API_KEY or not VAPI_PHONE_NUMBER_ID:
        print("Error: VAPI_API_KEY or VAPI_PHONE_NUMBER_ID not set in environment.")
        return None

    server_url = os.getenv("API_PUBLIC_URL")
    assistant_overrides = {
        "first_message": f"Hello, this is the Flow Reminder assistant calling you about a reminder for: {title}. Here are the details: {description}",
    }

    if server_url:
        assistant_overrides["server"] = {"url": f"{server_url}/webhook/vapi"}

    # Using a transient assistant for the call
    call = client.calls.create(
        phone_number_id=VAPI_PHONE_NUMBER_ID,
        customer={
            "number": phone_number,
        },
        assistant_id="f8441f2d-5313-4d26-badd-69d5449d8ceb",
        assistant_overrides=assistant_overrides
    )

    print(f"Call initiated: {getattr(call, 'id', 'unknown')}")
    return call
