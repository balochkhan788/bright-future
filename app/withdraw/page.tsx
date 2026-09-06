"use client";

import { useState } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  function handleWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (amount === "") {
      setMessage("Please enter an amount.");
      return;
    }

    setMessage("Demo withdrawal request submitted: Rs. " + amount);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">

          <h2 className="text-3xl font-bold">
            Demo Withdrawal
          </h2>

          <p className="mt-2 text-slate-400">
            Enter an amount for your demo withdrawal.
          </p>

          <form onSubmit={handleWithdraw} className="mt-8">

            <label className="text-sm text-slate-300">
              Withdrawal Amount
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-yellow-400 px-6 py-3 font-bold text-slate-950 hover:bg-yellow-300"
            >
              Request Demo Withdrawal
            </button>

          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-yellow-400/10 p-4 text-center">
              <p className="text-yellow-400">
                {message}
              </p>
            </div>
          )}

          <a
            href="/dashboard"
            className="mt-6 block text-center text-cyan-400"
          >
            Back to Dashboard
          </a>

        </div>

        <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-center text-sm text-slate-400">
          Demo Mode - No real money is processed.
        </div>

      </div>
    </main>
  );
}