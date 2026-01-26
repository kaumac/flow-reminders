"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { isValidPhoneNumber } from "libphonenumber-js";
import { api } from "@/lib/api";
import { PhoneInput } from "@/components/ui/phone-input";

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber) {
      setError("Phone number is required");
      return;
    }

    // Strict E.164 and validity check using libphonenumber-js
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("The phone number you entered is invalid. Please select a country on the dropdown and enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      // Using the shared axios instance
      const { data } = await api.post("/signin", {
        phone_number: phoneNumber,
      });

      console.log("Login success:", data);
      
      if (data.session_token) {
         Cookies.set('session_token', data.session_token, { expires: 7 });
         router.push("/");
      } else {
         setError("Login failed: No session token received");
      }
    } catch (err: unknown) {
      console.error("An error occurred", err);
      let message = "An error occurred during sign in";
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.detail) {
          message = typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </label>
          <PhoneInput
            id="phone"
            placeholder="Example: +1 234 567 890"
            value={phoneNumber}
            onChange={setPhoneNumber}
            className={error ? "border-red-500" : ""}
          />
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
