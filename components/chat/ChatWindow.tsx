"use client";
import { useState, useEffect, useRef } from "react";
import { X, Send, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ChatWindowProps {
  appointmentId: string;
  providerName: string;
  currentUserId: string; // The session user ID
  onClose: () => void;
}

export function ChatWindow({ appointmentId, providerName, currentUserId, onClose }: ChatWindowProps) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?appointmentId=${appointmentId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tempMsg = {
      id: "temp-" + Date.now(),
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setContent("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, content: tempMsg.content }),
    });
    fetchMessages();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg h-[550px] max-h-[85vh] shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-emerald-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shrink-0">
              <UserIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{providerName}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {lang === "ar" ? "محادثة مباشرة" : lang === "en" ? "Live Chat" : "Discussion en direct"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-app)]">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-7 h-7 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] p-10 text-sm">
              {lang === "ar" ? "لا توجد رسائل بعد. ابدأ المحادثة!" : lang === "en" ? "No messages yet. Start the conversation!" : "Aucun message. Commencez la discussion !"}
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${isMe ? "bg-primary-600 text-white rounded-br-xs" : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] rounded-bl-xs"}`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <div className={`text-[10px] mt-1 text-end ${isMe ? "text-white/70" : "text-[var(--text-muted)]"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] flex gap-2 bg-[var(--bg-card)] shrink-0">
          <input
            type="text"
            className="input flex-1 py-2.5 text-sm"
            placeholder={lang === "ar" ? "اكتب رسالتك..." : lang === "en" ? "Type your message..." : "Écrivez votre message..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={!content.trim()} className="btn-primary px-4 py-2.5 shrink-0">
            <Send size={16} className={lang === "ar" ? "rotate-180" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
