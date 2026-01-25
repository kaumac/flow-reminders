"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assuming API acts as a proxy or we call it directly. 
      // For now, hardcoding the API URL or assuming a proxy in next.config.js could be better, 
      // but let's try direct call first or assume equivalent port.
      // Since I don't have the exact API URL in env yet, I'll assume localhost:8000 for local dev
      // or usage of a NEXT_PUBLIC_API_URL env var if it existed.
      // I'll stick to a simple fetch for now.
      
      const res = await fetch("http://127.0.0.1:8000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Login success:", data);
        // Set a cookie for the session
        Cookies.set('session_token', data.user.phone_number, { expires: 7 }); // Expires in 7 days
        // Navigate to dashboard on success
        router.push("/");
      } else {
        console.error("Login failed");
        alert("Login failed");
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
