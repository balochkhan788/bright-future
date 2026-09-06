"use client";

import { useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("Demo login successful!");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Bright <span className="text-cyan-400">Future</span>
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome back
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">

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
                type="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Login
            </button>

          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-green-500/10 p-4 text-center">
              <p className="text-green-400">
                {message}
              </p>

              <a
                href="/dashboard"
                className="mt-3 inline-block rounded-lg bg-cyan-500 px-5 py-2 font-bold text-slate-950"
              >
                Open Dashboard
              </a>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-cyan-400">
              Create Account
            </a>
          </p>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo / Simulation Platform
        </p>

      </div>
    </main>
  );
}