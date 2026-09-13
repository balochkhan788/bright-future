"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupportPartner() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    setSent(true);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 text-white">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">
            Support{" "}
            <span className="text-cyan-400">
              Partner
            </span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Apna message support team ko bhejein.
          </p>
        </div>

        {/* Success Message */}
        {sent && (
          <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 p-4">
            <p className="text-green-400">
              Message submitted successfully.
            </p>
          </div>
        )}

        {/* Message Box */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6">

          <form onSubmit={handleSend}>

            <label className="text-sm font-semibold text-slate-300">
              Your Message
            </label>

            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSent(false);
              }}
              placeholder="Write your message here..."
              rows={7}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              className="mt-4 w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Message
            </button>

          </form>

        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-5 w-full rounded-xl bg-white/10 px-6 py-4 font-semibold text-white"
        >
          Back to Dashboard
        </button>

      </div>
    </main>
  );
}