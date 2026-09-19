"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentAccount = {
  account_name: string;
  iban: string;
};

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PaymentAccount | null>(null);

  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function openEasypaisa() {
    setMessage("");
    setShowAccount(false);
    setSelectedAccount(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data, error } = await supabase.rpc(
        "get_next_deposit_account"
      );

      if (error) {
        console.error("Account error:", error);
        setMessage("Unable to show payment account.");
        return;
      }

      const account = Array.isArray(data) ? data[0] : data;

      if (!account) {
        setMessage("No payment account available.");
        return;
      }

      setSelectedAccount(account);
      setShowAccount(true);
    } catch (error) {
      console.error(error);
      setMessage("Unable to show payment account.");
    }
  }

  async function handleDeposit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 0) {
      setMessage("Please enter a valid deposit amount.");
      return;
    }

    if (!showAccount || !selectedAccount) {
      setMessage("Please select Easypaisa first.");
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

      const fileExt =
        screenshot.name.split(".").pop() || "jpg";

      const fileName =
  String(user.id) + "/" + String(Date.now()) + "." + fileExt;

      const { error: uploadError } =
        await supabase.storage
          .from("deposit-screenshots")
          .upload(fileName, screenshot);

      if (uploadError) {
        console.error(
          "Screenshot upload error:",
          uploadError
        );

        setMessage(
  "Upload Error: " + uploadError.message
);

        setLoading(false);
        return;
      }

      const { error: depositError } =
        await supabase
          .from("deposits")
          .insert({
            user_id: user.id,
            amount: numericAmount,
            status: "pending",
            payment_method: "Easypaisa",
            transaction_id: transactionId.trim(),
            screenshot_url: fileName,
          });

      if (depositError) {
        console.error(
          "Deposit error:",
          depositError
        );

        setMessage(
          "Deposit request failed. Please try again."
        );

        setLoading(false);
        return;
      }

      setMessage(
        "Deposit request submitted successfully. Status: Pending."
      );

      setAmount("");
      setTransactionId("");
      setScreenshot(null);

      const fileInput =
        document.getElementById(
          "deposit-screenshot"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
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

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">

          <h2 className="text-3xl font-bold">
            Deposit
          </h2>

          <p className="mt-2 text-slate-400">
            Select Easypaisa to view the payment account.
          </p>

          <button
            type="button"
            onClick={openEasypaisa}
            className="mt-6 w-full rounded-xl border border-green-400/30 bg-green-500/10 p-5 text-left transition hover:bg-green-500/20"
          >
            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-2xl font-bold text-green-400">
                  Easypaisa
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Click to view payment account
                </p>
              </div>

              <span className="rounded-lg bg-green-500 px-4 py-2 font-bold text-slate-950">
                Select
              </span>

            </div>
          </button>

          {showAccount && selectedAccount && (
            <div className="mt-5 rounded-xl border border-green-400/30 bg-green-400/10 p-5">

              <h3 className="text-xl font-bold text-green-400">
                Easypaisa Account
              </h3>

              <p className="mt-4 text-sm text-slate-400">
                Account Name
              </p>

              <p className="text-lg font-bold">
                {selectedAccount.account_name}
              </p>

              <p className="mt-4 text-sm text-slate-400">
                IBAN Number
              </p>

              <p className="break-all text-lg font-bold">
                {selectedAccount.iban}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Please send your payment to this account.
              </p>

            </div>
          )}

          <form
            onSubmit={handleDeposit}
            className="mt-8"
          >

            <label className="text-sm text-slate-300">
              Deposit Amount
            </label>

            <input
              type="number"
              min="1"
              placeholder="e.g. 9000"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />

            <label className="mt-5 block text-sm text-slate-300">
              Payment Method
            </label>

            <input
              type="text"
              value="Easypaisa"
              readOnly
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />

            <label className="mt-5 block text-sm text-slate-300">
              Transaction ID
            </label>

            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) =>
                setTransactionId(e.target.value)
              }
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
              onChange={(e) =>
                setScreenshot(
                  e.target.files?.[0] || null
                )
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300"
            />

            <p className="mt-2 text-xs text-slate-500">
              Maximum screenshot size: 5 MB.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-green-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : "Submit Deposit Request"}
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
            onClick={() =>
              router.push("/dashboard")
            }
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