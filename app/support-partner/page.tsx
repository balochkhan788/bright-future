"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  user_id: string;
  sender_role: "user" | "support";
  message: string;
  created_at: string;
};

export default function SupportPartner() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("support-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim() || sending) {
      return;
    }

    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: user.id,
        sender_role: "user",
        message: message.trim(),
      });

    if (!error) {
      setMessage("");
      await loadMessages();
    }

    setSending(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-xl">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">
            Support{" "}
            <span className="text-cyan-400">
              Partner
            </span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Support team se direct message karein.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">

          <div className="mb-4 h-[420px] overflow-y-auto rounded-xl bg-slate-900 p-4">

            {loading ? (
              <p className="text-center text-slate-400">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-center text-slate-500">
                Abhi koi message nahi hai.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.sender_role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        item.sender_role === "user"
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="text-sm">
                        {item.message}
                      </p>

                      <p className="mt-1 text-[10px] opacity-60">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <form onSubmit={handleSend}>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Apna message likhein..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="mt-3 w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>

          </form>
        </div>

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