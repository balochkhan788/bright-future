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

export default function AdminMeeting() {
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("meeting_messages")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setMessages(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("admin-meeting-group")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "meeting_messages",
        },
        (payload) => {
          const newMessage =
            payload.new as MeetingMessage;

          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id === newMessage.id
              )
            ) {
              return current;
            }

            return [...current, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || sending) {
      return;
    }

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        return;
      }

      const { error } = await supabase
        .from("meeting_messages")
        .insert({
          user_id: user.id,
          sender_name: "Admin",
          sender_role: "admin",
          message: cleanMessage,
        });

      if (error) {
        console.error(error);
        alert(
          "Message send nahi ho saka."
        );
        return;
      }

      setMessage("");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white/5 p-8 text-center">
          Loading Meeting Group...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/95 px-4 py-4">

        <div className="mx-auto flex max-w-3xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              📢 Meeting Group
            </h1>

            <p className="text-sm text-slate-400">
              Admin + All Members
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl bg-white/10 px-4 py-2 font-bold hover:bg-white/20"
          >
            ← Admin
          </Link>

        </div>

      </header>

      {/* CHAT */}

      <div className="mx-auto flex min-h-[calc(100vh-82px)] max-w-3xl flex-col">

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">

          {messages.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center text-center">

              <div>
                <div className="text-6xl">
                  📢
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  Meeting Group
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Yahan Admin aur tamam members message kar sakte hain.
                </p>
              </div>

            </div>
          ) : (
            messages.map((item) => {

              const isAdmin =
                item.sender_role === "admin";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isAdmin
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      isAdmin
                        ? "rounded-br-md bg-cyan-500 text-slate-950"
                        : "rounded-bl-md bg-slate-800 text-white"
                    }`}
                  >

                    <p
                      className={`mb-1 text-xs font-bold ${
                        isAdmin
                          ? "text-slate-800"
                          : "text-cyan-300"
                      }`}
                    >
                      {isAdmin
                        ? "👨‍💼 Admin"
                        : item.sender_name}
                    </p>

                    <p className="whitespace-pre-wrap break-words">
                      {item.message}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isAdmin
                          ? "text-slate-700"
                          : "text-slate-500"
                      }`}
                    >
                      {new Date(
                        item.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                  </div>

                </div>
              );
            })
          )}

          <div ref={bottomRef} />

        </div>

        {/* ADMIN MESSAGE */}

        <div className="sticky bottom-0 border-t border-white/10 bg-slate-900 p-3">

          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2"
          >

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Admin announcement / message..."
              rows={2}
              className="min-h-[50px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={
                !message.trim() ||
                sending
              }
              className="rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-slate-950 disabled:opacity-40"
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}