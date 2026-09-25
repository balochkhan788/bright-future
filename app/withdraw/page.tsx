"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleWithdraw(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    const withdrawalAmount = Number(amount);

    if (!amount || withdrawalAmount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (!accountName.trim()) {
      setMessage("Please enter account holder name.");
      return;
    }

    if (!accountNumber.trim()) {
      setMessage("Please enter account number.");
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

      const { data, error } = await supabase.rpc(
        "request_withdrawal",
        {
          p_amount: withdrawalAmount,
          p_method: method,
          p_account_name: accountName.trim(),
          p_account_number: accountNumber.trim(),
        }
      );

      if (error) {
        console.error(
          "Withdrawal error:",
          error
        );

        if (
          error.message
            ?.toLowerCase()
            .includes("insufficient")
        ) {
          setMessage(
            "Insufficient wallet balance."
          );
        } else {
          setMessage(
            error.message ||
              "Withdrawal request failed."
          );
        }

        setLoading(false);
        return;
      }

      console.log(
        "Withdrawal result:",
        data
      );

      setMessage(
        "Withdrawal request submitted successfully. Status: Pending."
      );

      setAmount("");
      setAccountName("");
      setAccountNumber("");
    } catch (error) {
      console.error(
        "Withdrawal error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">

          <h2 className="text-3xl font-bold">
            Withdrawal
          </h2>

          <p className="mt-2 text-slate-400">
            Enter withdrawal and payment details.
          </p>

          <form
            onSubmit={handleWithdraw}
            className="mt-8"
          >

            {/* AMOUNT */}

            <label className="text-sm text-slate-300">
              Withdrawal Amount
            </label>

            <input
  type="number"
  min="1"
  placeholder="Enter withdrawal amount"
  value={amount}
  onChange={(e) =>
    setAmount(e.target.value)
  }
  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
/>

            {/* METHOD */}

            <label className="mt-5 block text-sm text-slate-300">
              Withdrawal Method
            </label>

            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            >
              <option value="bank">
                Bank Account
              </option>

              <option value="easypaisa">
                Easypaisa
              </option>

              <option value="jazzcash">
                JazzCash
              </option>

              <option value="upaisa">
                UPaisa
              </option>
            </select>

            {/* ACCOUNT HOLDER */}

            <label className="mt-5 block text-sm text-slate-300">
              Account Holder Name
            </label>

            <input
              type="text"
              placeholder="Enter account holder name"
              value={accountName}
              onChange={(e) =>
                setAccountName(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

            {/* ACCOUNT NUMBER */}

            <label className="mt-5 block text-sm text-slate-300">
              {method === "bank"
                ? "IBAN / Account Number"
                : "Mobile Account Number"}
            </label>

            <input
              type="text"
              placeholder={
                method === "bank"
                  ? "Enter IBAN or account number"
                  : "03XXXXXXXXX"
              }
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-yellow-400"
            />

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-yellow-400 px-6 py-3 font-bold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : "Request Withdrawal"}
            </button>

          </form>

          {/* MESSAGE */}

          {message && (
            <div className="mt-5 rounded-lg bg-yellow-400/10 p-4 text-center">
              <p className="text-yellow-400">
                {message}
              </p>
            </div>
          )}

          {/* HISTORY */}

          <a
            href="/withdrawal-history"
            className="mt-5 block text-center text-cyan-400"
          >
            View Withdrawal History
          </a>

          {/* DASHBOARD */}

          <a
            href="/dashboard"
            className="mt-3 block text-center text-slate-400"
          >
            Back to Dashboard
          </a>

        </div>

        <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-center text-sm text-slate-400">
          Withdrawal requests are reviewed before processing.
        </div>

      </div>
    </main>
  );
}