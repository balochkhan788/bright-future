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

  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportTable = supabase.from(
    "support_messages"
  ) as any;

  async function loadMessages() {
    const { data, error } = await supportTable
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (!error) {
      setMessages(data || []);
    }

    setLoading(false);
  }

  async function loadUserEmails() {
    const { data, error } = await supabase.rpc(
      "get_support_user_emails"
    );

    if (!error) {
      setUserEmails(data || []);
    }
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
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const conversations = Array.from(
    new Set(messages.map((item) => item.user_id))
  );

  const selectedMessages = messages.filter(
    (item) => item.user_id === selectedUser
  );

  function getUserEmail(userId: string) {
    const user = userEmails.find(
      (item) => item.user_id === userId
    );

    return user?.email || userId;
  }

  function handleScreenshot(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");

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
      setError("Screenshot 5MB se kam hona chahiye.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  }

  function removeScreenshot() {
    setSelectedFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function sendReply(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!selectedUser || sending) {
      return;
    }

    if (!reply.trim() && !selectedFile) {
      return;
    }

    setSending(true);
    setError("");

    try {
      let screenshotUrl: string | null = null;

      if (selectedFile) {
        const extension =
          selectedFile.name.split(".").pop() || "png";

        const filePath =
          '${selectedUser}/admin-${Date.now()}.${extension}';

        const { error: uploadError } =
          await supabase.storage
            .from("support-screenshots")
            .upload(
              filePath,
              selectedFile,
              {
                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicData } =
          supabase.storage
            .from("support-screenshots")
            .getPublicUrl(filePath);

        screenshotUrl =
          publicData.publicUrl;
      }

      const { error: insertError } =
        await supportTable.insert({
          user_id: selectedUser,
          sender_role: "support",
          message: reply.trim(),
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

      setError(
        "Message send nahi ho saka. Dobara try karein."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-6xl text-center">
          Loading Support Messages...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Support Partner
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              User support messages
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl bg-white px-4 py-2 font-bold text-slate-900"
          >
            ← Admin
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {/* USERS */}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-4 text-xl font-bold">
              Users
            </h2>

            {conversations.length === 0 ? (
              <p className="text-sm text-slate-400">
                No support messages yet.
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((userId) => (
                  <button
                    key={userId}
                    type="button"
                    onClick={() =>
                      setSelectedUser(userId)
                    }
                    className={`w-full rounded-xl p-4 text-left transition ${
                      selectedUser === userId
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-bold">
                      {getUserEmail(userId)}
                    </div>

                    <div className="mt-1 text-xs opacity-70">
                      {userId}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* CHAT */}

          <section className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">

            {!selectedUser ? (
              <div className="flex min-h-[500px] items-center justify-center text-center text-slate-400">
                <div>
                  <div className="text-5xl">💬</div>

                  <p className="mt-3 font-semibold">
                    Select a user to open chat
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-xl bg-slate-900 p-4">
                  <h2 className="font-bold">
                    {getUserEmail(selectedUser)}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedUser}
                  </p>
                </div>

                {/* MESSAGES */}

                <div className="mb-5 max-h-[450px] space-y-3 overflow-y-auto pr-1">

                  {selectedMessages.length === 0 ? (
                    <p className="text-center text-slate-500">
                      No messages yet.
                    </p>
                  ) : (
                    selectedMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`flex ${
                          item.sender_role === "support"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 ${
                            item.sender_role === "support"
                              ? "bg-cyan-500 text-slate-950"
                              : "bg-slate-800 text-white"
                          }`}
                        >
                          {item.message && (
                            <p className="whitespace-pre-wrap">
                              {item.message}
                            </p>
                          )}

                          {item.screenshot_url && (
                            <a
                              href={item.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 block"
                            >
                              <img
                                src={item.screenshot_url}
                                alt="Screenshot"
                                className="max-h-72 w-full rounded-xl object-contain"
                              />
                            </a>
                          )}

                          <p className="mt-2 text-xs opacity-60">
                            {new Date(
                              item.created_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                </div>

                {/* SCREENSHOT UPLOAD — ALWAYS VISIBLE */}

                <div className="mb-3 rounded-2xl border-2 border-cyan-400 bg-cyan-400/10 p-3">

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
                    className="w-full rounded-xl bg-cyan-500 px-4 py-4 text-lg font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    📷 Screenshot Upload
                  </button>

                  <p className="mt-2 text-center text-xs text-cyan-200">
                    User ko screenshot bhejne ke liye yahan click karein
                  </p>

                </div>

                {/* PREVIEW */}

                {preview && (
                  <div className="mb-4 rounded-2xl border border-cyan-400/30 bg-slate-900 p-3">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-bold text-cyan-300">
                        🖼️ Screenshot Preview
                      </span>

                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <img
                      src={preview}
                      alt="Screenshot preview"
                      className="max-h-72 w-full rounded-xl object-contain"
                    />

                  </div>
                )}

                {error && (
                  <div className="mb-3 rounded-xl bg-red-500/10 p-3 text-center text-sm font-semibold text-red-400">
                    {error}
                  </div>
                )}

                {/* REPLY */}

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
                    className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-4 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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

          </section>

        </div>

      </div>
    </main>
  );
}