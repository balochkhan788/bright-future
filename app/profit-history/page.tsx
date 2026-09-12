"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Earning = {
  id: string;
  amount: number;
  earning_type: string;
  description: string | null;
  created_at: string;
};

export default function ProfitHistoryPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    setLoading(true);
    setMessage("");

    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const result = await supabase
      .from("earnings")
      .select(
        "id, amount, earning_type, description, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    setEarnings(
      (result.data || []).map((item) => ({
        id: item.id,
        amount: Number(item.amount),
        earning_type: item.earning_type,
        description: item.description,
        created_at: item.created_at,
      }))
    );

    setLoading(false);
  }

  function formatType(type: string) {
    if (type === "daily_task") {
      return "Daily Task";
    }

    if (type === "referral") {
      return "Referral";
    }

    return type;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  const total = earnings.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <p>Loading Profit History...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
        </h1>

        <p className="mt-2 text-slate-400">
          Profit History
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Total Earnings
          </p>

          <p className="mt-2 text-3xl font-bold text-green-400">
            Rs. {total.toLocaleString()}
          </p>
        </div>

        {message !== "" && (
          <div className="mt-6 rounded-xl bg-red-400/10 p-4 text-red-300">
            {message}
          </div>
        )}

        {earnings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
            No profit records found.
          </div>
        ) : (
          <div className="mt-8 space-y-4">

            {earnings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row">

                  <div>
                    <p className="text-lg font-bold text-cyan-400">
                      {formatType(item.earning_type)}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.description || "Profit earning"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <div className="text-xl font-bold text-green-400">
                    + Rs. {item.amount.toLocaleString()}
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-white/10 px-6 py-3 font-bold"
        >
          ← Back to Dashboard
        </a>

      </div>
    </main>
  );
}