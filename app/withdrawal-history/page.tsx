"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Withdrawal = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function loadWithdrawals() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("withdrawals")
        .select("id, amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Withdrawal history error:", error);
        setMessage("Unable to load withdrawal history.");
        setLoading(false);
        return;
      }

      setWithdrawals(data || []);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  function getStatusClass(status: string) {
    if (status === "approved") {
      return "text-green-400";
    }

    if (status === "rejected") {
      return "text-red-400";
    }

    return "text-yellow-400";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Withdrawal{" "}
              <span className="text-cyan-400">History</span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View your withdrawal requests
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm"
          >
            Dashboard
          </a>
        </div>

        {loading && (
          <p className="mt-8 text-center text-slate-400">
            Loading withdrawal history...
          </p>
        )}

        {!loading && message && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-center">
            <p className="text-red-400">
              {message}
            </p>
          </div>
        )}

        {!loading && !message && withdrawals.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-slate-400">
              No withdrawal requests found.
            </p>
          </div>
        )}

        {!loading && !message && withdrawals.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="grid grid-cols-4 border-b border-white/10 pb-4 text-sm font-bold text-slate-400">
              <span>Request ID</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>

            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="grid grid-cols-4 border-b border-white/10 py-5 last:border-b-0"
              >
                <span className="break-all text-xs md:text-sm">
                  {withdrawal.id}
                </span>

                <span className="font-bold">
                  Rs. {Number(withdrawal.amount).toLocaleString()}
                </span>

                <span className="text-sm text-slate-400">
                  {new Date(
                    withdrawal.created_at
                  ).toLocaleString()}
                </span>

                <span
                  className={
                    "font-bold uppercase " +
                    getStatusClass(withdrawal.status)
                  }
                >
                  {withdrawal.status}
                </span>
              </div>
            ))}

          </div>
        )}

        <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300">
          Withdrawal requests are reviewed before processing.
        </div>

      </div>
    </main>
  );
}