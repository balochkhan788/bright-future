"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  user_id: string;
  sender_role: "user" | "support";
  message: string;
  screenshot_url?: string | null;
  created_at: string;
};

export default function SupportPartner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const supportTable = supabase.from(
      "support_messages"
    ) as any;

    const { data, error: loadError } = await supportTable
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (loadError) {
      console.error(loadError);
      setError("Messages load nahi ho sake.");
    } else {
      setMessages((data || []) as Message[]);
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

  async function handleSend(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if ((!message.trim() && !selectedFile) || sending) {
      return;
    }

    setSending(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      setSending(false);
      return;
    }

    try {
      let screenshotUrl: string | null = null;

      if (selectedFile) {
        const extension =
          selectedFile.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const filePath = '${user.id}/${Date.now()}.${extension}'

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

        screenshotUrl = publicUrlData.publicUrl;
      }

      const supportTable = supabase.from(
        "support_messages"
      ) as any;

      const { error: insertError } =
        await supportTable.insert({
          user_id: user.id,
          sender_role: "user",
          message:
            message.trim() || "Screenshot attached",
          screenshot_url: screenshotUrl,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("");
      removeScreenshot();

      await loadMessages();
    } catch (err) {
      console.error(err);
      setError("Message send nahi ho saka.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-xl">

        {/* Welcome */}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold">
            Support{" "}
            <span className="text-cyan-400">
              Partner
            </span>
          </h1>

          <p className="mt-3 text-sm font-semibold text-cyan-400">
            Welcome to Bright Future
          </p>

          <p className="mt-1 text-sm text-slate-400">
            💬 How can I help you?
          </p>
        </div>

        {/* Chat */}

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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        item.sender_role === "user"
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {item.message}
                      </p>

                      {item.screenshot_url && (
                        <a
                          href={item.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={item.screenshot_url}
                            alt="Screenshot"
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
                ))}
              </div>
            )}

          </div>

          {error && (
            <div className="mb-3 rounded-xl bg-red-500/10 p-3 text-center text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          {/* Message */}

          <form onSubmit={handleSend}>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Apna message likhein..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400"
            />

            {/* Screenshot input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              className="hidden"
            />

            {/* Screenshot preview */}

            {preview && (
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-900 p-3">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-400">
                    🖼️ Screenshot Preview
                  </span>

                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400"
                  >
                    Remove
                  </button>
                </div>

                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="max-h-48 w-full rounded-xl object-contain"
                />

              </div>
            )}

            {/* Buttons */}

            <div className="mt-3 flex gap-2">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={sending}
                className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 font-bold text-cyan-400 disabled:opacity-50"
              >
                📷 Screenshot
              </button>

              <button
                type="submit"
                disabled={
                  (!message.trim() && !selectedFile) ||
                  sending
                }
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </div>

          </form>
        </div>

        {/* Dashboard */}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-5 w-full rounded-xl bg-white/10 px-6 py-4 font-semibold text-white"
        >
          Back to Dashboard
        </button>

      </div>
    </main>
  );
}