"use client";

import { useState } from "react";

export default function SignupPage() {
  const [message, setMessage] = useState("");

  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage("Demo account created successfully!");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Bright <span className="text-cyan-400">Future</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Create your demo account
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-bold">
            Sign Up
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Full Name
              </label>

              <input
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
              className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Create Account
            </button>

          </form>

          {message && (
            <p className="mt-5 rounded-lg bg-green-500/10 p-3 text-center text-green-400">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-cyan-400">
              Login
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}