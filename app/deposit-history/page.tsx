"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Deposit = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function DepositHistory() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDeposits() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("deposits")
        .select("id, amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Deposit history error:", error);
        setMessage("Unable to load deposit history.");
        setLoading(false);
        return;
      }

      setDeposits(data || []);
      setLoading(false);
    }

    loadDeposits();
  }, []);

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
      <div className="mx-auto max-w-3xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">

          <h2 className="text-3xl font-bold">
            Deposit History
          </h2>

          <p className="mt-2 text-slate-400">
            Your deposit requests and their current status.
          </p>

          {loading && (
            <p className="mt-8 text-center text-slate-400">
              Loading...
            </p>
          )}

          {!loading && message && (
            <p className="mt-8 text-center text-red-400">
              {message}
            </p>
          )}

          {!loading && !message && deposits.length === 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-slate-900 p-6 text-center">
              <p className="text-slate-400">
                No deposit requests found.
              </p>
            </div>
          )}

          {!loading && deposits.length > 0 && (
            <div className="mt-8 space-y-4">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="rounded-xl border border-white/10 bg-slate-900 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        Rs. {Number(deposit.amount).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        Status
                      </p>

                      <p
                        className={
                          "mt-1 font-bold uppercase " +
                          getStatusClass(deposit.status)
                        }
                      >
                        {deposit.status}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-sm text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm">
                      {new Date(deposit.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <a
            href="/dashboard"
            className="mt-8 block text-center text-cyan-400"
          >
            Back to Dashboard
          </a>

        </div>

      </div>
    </main>
  );
}