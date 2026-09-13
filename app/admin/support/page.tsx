"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: "user" | "support";
  message: string;
  created_at: string;
};

type Conversation = {
  user_id: string;
  messages: SupportMessage[];
};

type UserEmail = {
  user_id: string;
  email: string;
};

export default function AdminSupport() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [unreadUsers, setUnreadUsers] = useState<string[]>([]);
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);
    }

    setLoading(false);
  }

  async function loadUserEmails() {
    const { data, error } = await supabase.rpc(
      "get_support_user_emails"
    );

    if (error) {
      console.error("Failed to load user emails:", error);
      return;
    }

    setUserEmails(data || []);
  }

  function getUserEmail(userId: string) {
    const user = userEmails.find(
      (item) => item.user_id === userId
    );

    return user?.email || userId;
  }

  useEffect(() => {
    loadMessages();
    loadUserEmails();

    const channel = supabase
      .channel("admin-support-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;

          setMessages((current) => [...current, newMessage]);

          if (
            newMessage.sender_role === "user" &&
            newMessage.user_id !== selectedUser
          ) {
            setUnreadUsers((current) => {
              if (current.includes(newMessage.user_id)) {
                return current;
              }

              return [...current, newMessage.user_id];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);

  const conversations: Conversation[] = [];

  messages.forEach((message) => {
    const existing = conversations.find(
      (conversation) =>
        conversation.user_id === message.user_id
    );

    if (existing) {
      existing.messages.push(message);
    } else {
      conversations.push({
        user_id: message.user_id,
        messages: [message],
      });
    }
  });

  const selectedConversation = conversations.find(
    (conversation) => conversation.user_id === selectedUser
  );

  function selectUser(userId: string) {
    setSelectedUser(userId);

    setUnreadUsers((current) =>
      current.filter((id) => id !== userId)
    );
  }

  async function sendReply(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!selectedUser || !reply.trim() || sending) {
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: selectedUser,
        sender_role: "support",
        message: reply.trim(),
      });

    if (!error) {
      setReply("");
      await loadMessages();
    } else {
      alert(error.message);
    }

    setSending(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">
            Support{" "}
            <span className="text-cyan-400">
              Messages
            </span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Users ke messages aur replies manage karein.
          </p>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl bg-white/5 p-6">
            Loading...
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <h2 className="mb-4 text-lg font-bold">
                Users
              </h2>

              {conversations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No messages yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => {
                    const lastMessage =
                      conversation.messages[
                        conversation.messages.length - 1
                      ];

                    const isUnread =
                      unreadUsers.includes(
                        conversation.user_id
                      );

                    return (
                      <button
                        key={conversation.user_id}
                        onClick={() =>
                          selectUser(
                            conversation.user_id
                          )
                        }
                        className={`w-full rounded-xl p-4 text-left ${
                          selectedUser ===
                          conversation.user_id
                            ? "bg-cyan-500 text-slate-950"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">

                          <p className="break-all text-sm font-semibold">
                            {getUserEmail(
                              conversation.user_id
                            )}
                          </p>

                          {isUnread && (
                            <span className="shrink-0 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                              NEW
                            </span>
                          )}

                        </div>

                        <p className="mt-1 truncate text-xs opacity-70">
                          {lastMessage.message}
                        </p>

                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">

              {!selectedConversation ? (
                <div className="flex h-[500px] items-center justify-center text-slate-500">
                  Select a user to view messages.
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-xl bg-cyan-500/10 p-3">
                    <p className="text-xs text-slate-400">
                      User
                    </p>

                    <p className="mt-1 break-all font-semibold text-cyan-300">
                      {getUserEmail(selectedUser!)}
                    </p>
                  </div>

                  <div className="mb-4 h-[400px] overflow-y-auto rounded-xl bg-slate-900 p-4">

                    <div className="space-y-3">
                      {selectedConversation.messages.map(
                        (item) => (
                          <div
                            key={item.id}
                            className={`flex ${
                              item.sender_role === "support"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                item.sender_role ===
                                "support"
                                  ? "bg-cyan-500 text-slate-950"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              <p className="text-sm">
                                {item.message}
                              </p>

                              <p className="mt-1 text-[10px] opacity-60">
                                {new Date(
                                  item.created_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                  </div>

                  <form onSubmit={sendReply}>

                    <textarea
                      value={reply}
                      onChange={(e) =>
                        setReply(e.target.value)
                      }
                      placeholder="Reply to user..."
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400"
                    />

                    <button
                      type="submit"
                      disabled={!reply.trim() || sending}
                      className="mt-3 w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? "Sending..."
                        : "Send Reply"}
                    </button>

                  </form>
                </>
              )}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}