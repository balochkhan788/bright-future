"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("JazzCash");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 0) {
      setMessage("Please enter a valid deposit amount.");
      return;
    }

    if (!transactionId.trim()) {
      setMessage("Please enter your Transaction ID.");
      return;
    }

    if (!screenshot) {
      setMessage("Please upload your payment screenshot.");
      return;
    }

    if (!screenshot.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    if (screenshot.size > 5 * 1024 * 1024) {
      setMessage("Screenshot size must be less than 5 MB.");
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

      const fileExt = screenshot.name.split(".").pop() || "jpg";

      const fileName = '${user.id}/${Date.now()}.${fileExt}';

      const { error: uploadError } = await supabase.storage
        .from("deposit-screenshots")
        .upload(fileName, screenshot);

      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
        setMessage("Screenshot upload failed. Please try again.");
        setLoading(false);
        return;
      }

      const { error: depositError } = await supabase
        .from("deposits")
        .insert({
          user_id: user.id,
          amount: numericAmount,
          status: "pending",
          payment_method: method,
          transaction_id: transactionId.trim(),
          screenshot_url: fileName,
        });

      if (depositError) {
        console.error("Deposit error:", depositError);
        setMessage("Deposit request failed. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(
        "Deposit request submitted successfully. Status: Pending."
      );

      setAmount("");
      setTransactionId("");
      setScreenshot(null);

      const fileInput = document.getElementById(
        "deposit-screenshot"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
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

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-3xl font-bold">Deposit</h2>

          <p className="mt-2 text-slate-400">
            Send payment to one of the accounts below and submit your
            transaction details.
          </p>

          <div className="mt-6 rounded-xl border border-pink-400/20 bg-pink-400/5 p-4">
            <h3 className="text-xl font-bold text-pink-400">
              JazzCash
            </h3>

            <p className="mt-3 text-sm text-slate-400">
              Account Name
            </p>

            <p className="font-semibold">
              Gul Muhammed
            </p>

            <p className="mt-3 text-sm text-slate-400">
              IBAN Number
            </p>

            <p className="break-all font-semibold">
              PK46TMFB0000000016328974
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-green-400/20 bg-green-400/5 p-4">
            <h3 className="text-xl font-bold text-green-400">
              Easypaisa
            </h3>

            <p className="mt-3 text-sm text-slate-400">
              Account Name
            </p>

            <p className="font-semibold">
              Zaib Ul Nisa
            </p>

            <p className="mt-3 text-sm text-slate-400">
              IBAN Number
            </p>

            <p className="break-all font-semibold">
              PK34JCMA2008923338466262
            </p>
          </div>

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

            <label className="mt-5 block text-sm text-slate-300">
              Payment Method
            </label>

            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            >
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
            </select>

            <label className="mt-5 block text-sm text-slate-300">
              Transaction ID
            </label>

            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />

            <label
              htmlFor="deposit-screenshot"
              className="mt-5 block text-sm text-slate-300"
            >
              Payment Screenshot
            </label>

            <input
              id="deposit-screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setScreenshot(e.target.files?.[0] || null);
              }}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300"
            />

            <p className="mt-2 text-xs text-slate-500">
              Upload your payment screenshot. Maximum size: 5 MB.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-green-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Deposit Request"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-lg bg-green-500/10 p-4 text-center">
              <p className="text-green-400">{message}</p>
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