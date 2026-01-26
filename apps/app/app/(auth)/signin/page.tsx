"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      // Using the shared axios instance
      const { data } = await api.post("/signin", {
        phone_number: phoneNumber,
      });

      console.log("Login success:", data);
      
      // key change: use session_token from response, not phone_number
      // Also, ideally the cookie should be httpOnly set by the server, 
      // but if we are setting it here for now (as per current architecture), use the token.
      if (data.session_token) {
         Cookies.set('session_token', data.session_token, { expires: 7 });;
         router.push("/");
      } else {
         console.error("No session token received");
         alert("Login failed: No session token");
      }
    } catch (error) {
      console.error("An error occurred", error);
      alert("An error occurred");
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
          <input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            className="rounded-md border p-2"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
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
