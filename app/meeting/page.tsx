"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MeetingMessage = {
  id: string;
  user_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
};

export default function MeetingPage() {
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("User");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const loadMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    setUserName(name);

    const { data, error } = await supabase
      .from("meeting_messages")
      .select(
        "id, user_id, sender_name, sender_role, message, created_at"
      )
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as MeetingMessage[]);
      scrollToBottom();
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("meeting-messages-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_messages",
        },
        (payload) => {
          const newMessage = payload.new as MeetingMessage;

          setMessages((previous) => {
            if (previous.some((item) => item.id === newMessage.id)) {
              return previous;
            }

            return [...previous, newMessage];
          });

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || sending || !userId) return;

    setSending(true);

    const { error } = await supabase
      .from("meeting_messages")
      .insert({
        user_id: userId,
        sender_name: userName,
        sender_role: "user",
        message: cleanMessage,
      });

    if (!error) {
      setMessage("");
    }

    setSending(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 p-8 text-center">
          Loading Meeting Group...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        <header className="border-b border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                📢 Meeting Group
              </h1>

              <p className="text-xs text-slate-400">
                Common group • All members
              </p>
            </div>

            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-800"
            >
              ← Dashboard
            </Link>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <div className="text-5xl">💬</div>
              <p className="mt-3">
                ابھی کوئی message نہیں ہے۔
              </p>
            </div>
          ) : (
            messages.map((item) => {
              const ownMessage = item.user_id === userId;
              const isAdmin = item.sender_role === "admin";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    ownMessage
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      ownMessage
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    <div className="mb-1 text-xs font-bold">
                      {isAdmin
                        ? "👨‍💼 Admin"
                        : item.sender_name}
                    </div>

                    <div className="break-words text-sm">
                      {item.message}
                    </div>

                    <div
                      className={`mt-1 text-[10px] ${
                        ownMessage
                          ? "text-slate-700"
                          : "text-slate-500"
                      }`}
                    >
                      {new Date(
                        item.created_at
                      ).toLocaleString("en-PK")}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-700 bg-slate-800 p-3">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="Message لکھیں..."
              className="min-w-0 flex-1 resize-none rounded-xl border border-slate-600 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={
                sending || !message.trim()
              }
              className="rounded-xl bg-cyan-500 px-5 font-bold text-slate-950 disabled:opacity-40"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
