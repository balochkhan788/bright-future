"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type SupportMessage = {
  id: string;
  user_id: string;
  sender_role: "user" | "support";
  message: string;
  screenshot_url?: string | null;
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadMessages() {
    const supportTable = supabase.from(
      "support_messages"
    ) as any;

    const { data, error } = await supportTable
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages((data || []) as SupportMessage[]);
    } else {
      console.error(error);
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
          const newMessage =
            payload.new as SupportMessage;

          setMessages((current) => [
            ...current,
            newMessage,
          ]);

          if (
            newMessage.sender_role === "user" &&
            newMessage.user_id !== selectedUser
          ) {
            setUnreadUsers((current) => {
              if (current.includes(newMessage.user_id)) {
                return current;
              }

              return [
                ...current,
                newMessage.user_id,
              ];
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
    (conversation) =>
      conversation.user_id === selectedUser
  );

  function selectUser(userId: string) {
    setSelectedUser(userId);

    setUnreadUsers((current) =>
      current.filter((id) => id !== userId)
    );
  }

  function handleScreenshot(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Sirf image screenshot upload karein.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot 5 MB se kam hona chahiye.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  }

  function removeScreenshot() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function sendReply(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !selectedUser ||
      (!reply.trim() && !selectedFile) ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      let screenshotUrl: string | null = null;

      if (selectedFile) {
        const extension =
          selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filePath =
          '${selectedUser}/admin-${Date.now()}.${extension}';

        const { error: uploadError } =
          await supabase.storage
            .from("support-screenshots")
            .upload(filePath, selectedFile, {
              contentType: selectedFile.type,
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("support-screenshots")
            .getPublicUrl(filePath);

        screenshotUrl =
          publicUrlData.publicUrl;
      }

      const supportTable = supabase.from(
        "support_messages"
      ) as any;

      const { error: insertError } =
        await supportTable.insert({
          user_id: selectedUser,
          sender_role: "support",
          message:
            reply.trim() || "Screenshot attached",
          screenshot_url: screenshotUrl,
        });

      if (insertError) {
        throw insertError;
      }

      setReply("");
      removeScreenshot();

      await loadMessages();
    } catch (err) {
      console.error(err);
      setError("Reply send nahi ho saka.");
    } finally {
      setSending(false);
    }
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
                        type="button"
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
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                item.sender_role ===
                                "support"
                                  ? "bg-cyan-500 text-slate-950"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm">
                                {item.message}
                              </p>

                              {item.screenshot_url && (
                                <a
                                  href={
                                    item.screenshot_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={
                                      item.screenshot_url
                                    }
                                    alt="Support screenshot"
                                    className="mt-3 max-h-64 rounded-xl object-contain"
                                  />
                                </a>
                              )}

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

                  {error && (
                    <div className="mb-3 rounded-xl bg-red-500/10 p-3 text-center text-sm font-semibold text-red-400">
                      {error}
                    </div>
                  )}

                  {/* SCREENSHOT BUTTON - CLEARLY VISIBLE */}
                  <div className="mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshot}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={sending}
                      className="w-full rounded-xl border-2 border-cyan-400 bg-cyan-400/10 px-4 py-4 text-center text-lg font-bold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      📷 Screenshot Upload
                    </button>
                  </div>

                  {preview && (
                    <div className="mb-3 rounded-xl border border-cyan-400/30 bg-slate-900 p-3">

                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-cyan-400">
                          🖼️ Screenshot Preview
                        </span>

                        <button
                          type="button"
                          onClick={removeScreenshot}
                          disabled={sending}
                          className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400"
                        >
                          Remove
                        </button>
                      </div>

                      <img
                        src={preview}
                        alt="Screenshot preview"
                        className="max-h-56 w-full rounded-xl object-contain"
                      />

                    </div>
                  )}

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
                      disabled={
                        (!reply.trim() &&
                          !selectedFile) ||
                        sending
                      }
                      className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-4 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? "Sending..."
                        : selectedFile
                        ? "📷 Send Message + Screenshot"
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