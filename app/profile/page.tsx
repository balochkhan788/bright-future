"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [fullName, setFullName] = useState("Loading...");
  const [email, setEmail] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "Member";

    setFullName(name);
    setEmail(user.email || "No email");

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <h2 className="mt-10 text-3xl font-bold">Profile</h2>

        <div className="mt-6 rounded-xl bg-white/10 p-6">
          <p className="text-slate-400">Full Name</p>
          <p className="mt-1 text-xl font-semibold">
            {loading ? "Loading..." : fullName}
          </p>

          <p className="mt-6 text-slate-400">Email</p>
          <p className="mt-1 text-xl font-semibold">
            {loading ? "Loading..." : email}
          </p>

          <p className="mt-6 text-slate-400">Account Type</p>
          <p className="mt-1 text-xl font-semibold text-cyan-400">
            Member Account
          </p>
        </div>

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950"
        >
          Back to Dashboard
        </a>
      </div>
    </main>
  );
}