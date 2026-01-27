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

    # Using a transient assistant for the call
    call = client.calls.create(
        phone_number_id=VAPI_PHONE_NUMBER_ID,
        customer={
            "number": phone_number,
        },
        assistant={
            "name": "Flow Reminder Assistant",
            "first_message": f"Hello, this is the Flow Reminder assistant calling you about a reminder for: {title}. Here are the details: {description}",
            "model": {
                "provider": "openai",
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": f"Hello, this is the Flow Reminder assistant calling you about a reminder for: {title}. Here are the details: {description}"
                    }
                ]
            },
            "voice": {
                "provider": "11labs",
                "voice_id": "rachel"
            },
            "transcriber": {
                "provider": "deepgram",
                "model": "nova-2",
                "language": "en"
            }
        }
    )

    print(f"Call initiated: {getattr(call, 'id', 'unknown')}")
    return call
