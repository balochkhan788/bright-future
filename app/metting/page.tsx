"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return null;
    }

    setUserId(user.id);

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    setUserName(name);

    return user;
  }

  async function loadMessages() {
    const { data, error } = await supabase
      .from("meeting_messages")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Meeting messages error:",
        error
      );
      return;
    }

    setMessages(data || []);
  }

  useEffect(() => {
    async function start() {
      const user = await loadUser();

      if (!user) {
        return;
      }

      await loadMessages();
      setLoading(false);
    }

    start();

    const channel = supabase
      .channel("bright-future-meeting-group")
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
    messagesEndRef.current?.scrollIntoView({
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
        router.push("/login");
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      const { error } = await supabase
        .from("meeting_messages")
        .insert({
          user_id: user.id,
          sender_name: name,
          sender_role: "user",
          message: cleanMessage,
        });

      if (error) {
        console.error(
          "Send meeting message error:",
          error
        );

        alert(
          "Message send nahi ho saka."
        );

        return;
      }

      setMessage("");
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white/5 p-8 text-center">
          <p className="font-semibold">
            Loading Meeting Group...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur">

        <div className="mx-auto flex max-w-2xl items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-xl">
              📢
            </div>

            <div>
              <h1 className="font-bold">
                Bright Future Meeting
              </h1>

              <p className="text-xs text-slate-400">
                All Members Group
              </p>
            </div>

          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Dashboard
          </Link>

        </div>

      </header>

      {/* CHAT */}

      <div className="mx-auto flex min-h-[calc(100vh-82px)] max-w-2xl flex-col">

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">

          {messages.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center text-center">

              <div>

                <div className="text-6xl">
                  💬
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  Welcome to the Meeting Group
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Admin aur members yahan messages share kar sakte hain.
                </p>

              </div>

            </div>
          ) : (
            messages.map((item) => {

              const isMine =
                item.user_id === userId;

              const isAdmin =
                item.sender_role === "admin";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "rounded-br-md bg-cyan-500 text-slate-950"
                        : "rounded-bl-md bg-slate-800 text-white"
                    }`}
                  >

                    {!isMine && (
                      <p
                        className={`mb-1 text-xs font-bold ${
                          isAdmin
                            ? "text-yellow-400"
                            : "text-cyan-300"
                        }`}
                      >
                        {isAdmin
                          ? "👨‍💼 Admin"
                          : item.sender_name}
                      </p>
                    )}

                    <p className="whitespace-pre-wrap break-words">
                      {item.message}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isMine
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

          <div ref={messagesEndRef} />

        </div>

        {/* MESSAGE INPUT */}

        <div className="sticky bottom-0 border-t border-white/10 bg-slate-900 p-3">

          <form
            onSubmit={sendMessage}
            className="mx-auto flex max-w-2xl items-end gap-2"
          >

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Message..."
              rows={1}
              className="min-h-[48px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={
                !message.trim() ||
                sending
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xl text-slate-950 disabled:opacity-40"
            >
              ➤
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}