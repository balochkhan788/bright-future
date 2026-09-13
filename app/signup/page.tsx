"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const form = e.currentTarget;

    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value;

    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value;

    const password = (
      form.elements.namedItem("password") as HTMLInputElement
    ).value;

    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Referral code URL se lena
      let referralCode = "";

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        referralCode = params.get("ref") || "";
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            referral_code: referralCode || null,
          },
        },
      });

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Account created successfully. Please check your email to verify your account."
      );
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      setMessage(
        "Failed to fetch. Please check your Supabase connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Bright <span className="text-cyan-400">Future</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Create your account
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Sign Up
          </h2>

          <form
            onSubmit={handleSignup}
            className="space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full Name
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <input
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Confirm Password
              </label>

              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {message && (
            <p className="mt-5 rounded-lg bg-green-500/10 p-3 text-center text-green-400">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-cyan-400"
            >
              Login
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}