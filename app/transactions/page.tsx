"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
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
        .from("wallet_transactions")
        .select("id, type, amount, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Transaction error:", error);
        setMessage("Unable to load transactions.");
        setLoading(false);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  function getAmountClass(type: string) {
    if (
      type === "deposit" ||
      type === "earning" ||
      type === "withdrawal_reversal" ||
      type === "referral_reward"
    ) {
      return "text-green-400";
    }

    return "text-red-400";
  }

  function getAmountPrefix(type: string) {
    if (
      type === "deposit" ||
      type === "earning" ||
      type === "withdrawal_reversal" ||
      type === "referral_reward"
    ) {
      return "+";
    }

    return "-";
  }

  function getTransactionName(type: string) {
    if (type === "withdrawal_reversal") {
      return "Withdrawal Reversal";
    }

    if (type === "withdrawal") {
      return "Withdrawal";
    }

    if (type === "deposit") {
      return "Deposit";
    }

    if (type === "earning") {
      return "Earning";
    }

    if (type === "referral_reward") {
      return "Referral Reward";
    }

    return type;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
        </h1>

        <h2 className="mt-10 text-3xl font-bold">
          Transaction History
        </h2>

        <p className="mt-2 text-slate-400">
          Your wallet transaction records
        </p>

        {loading && (
          <p className="mt-8 text-center text-slate-400">
            Loading transactions...
          </p>
        )}

        {!loading && message && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-center">
            <p className="text-red-400">
              {message}
            </p>
          </div>
        )}

        {!loading &&
          !message &&
          transactions.length === 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-slate-400">
                No transactions found.
              </p>
            </div>
          )}

        {!loading &&
          !message &&
          transactions.length > 0 && (
            <div className="mt-8 space-y-4">

              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="font-bold">
                        {getTransactionName(
                          transaction.type
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {transaction.description ||
                          "Wallet transaction"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(
                          transaction.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <p
                      className={
                        "text-xl font-bold " +
                        getAmountClass(
                          transaction.type
                        )
                      }
                    >
                      {getAmountPrefix(
                        transaction.type
                      )}
                      Rs.{" "}
                      {Number(
                        transaction.amount
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

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