"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      console.log("Testing Supabase connection...");
      console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      console.log("Supabase response:", data);
      console.log("Supabase error:", loginError);

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      setMessage("Login successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (err) {
      console.log("FULL ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to Supabase"
      );

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-green-500/10 p-4 text-center">
              <p className="text-green-400">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-center">
              <p className="text-red-400">
                {error}
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-cyan-400">
              Create Account
            </a>
          </p>

        </div>

      </div>
    </main>
  );
}