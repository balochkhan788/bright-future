"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount: numericAmount,
        status: "pending",
      });

      if (error) {
        console.error("Deposit error:", error);
        setMessage("Deposit request failed. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(
        "Deposit request submitted successfully. Status: Pending"
      );
      setAmount("");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">

          <h2 className="text-3xl font-bold">
            Deposit
          </h2>

          <p className="mt-2 text-slate-400">
            Enter the amount you want to deposit.
          </p>

          <form onSubmit={handleDeposit} className="mt-8">

            <label className="text-sm text-slate-300">
              Deposit Amount
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 9000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-green-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Deposit Request"}
            </button>

          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-green-500/10 p-4 text-center">
              <p className="text-green-400">
                {message}
              </p>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 block w-full text-center text-cyan-400"
          >
            Back to Dashboard
          </button>

        </div>

        <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-center text-sm text-slate-400">
          Deposit requests require approval before funds are credited.
        </div>

      </div>
    </main>
  );
}