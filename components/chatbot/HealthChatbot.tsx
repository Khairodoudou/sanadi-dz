"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Heart } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MSG: Message = {
  role: "assistant",
  content: "👋 Bonjour ! Je suis **SanadiBot**, votre assistant santé intelligent.\n\nJe suis là pour répondre à vos questions médicales, vous orienter vers le bon spécialiste, et vous donner des conseils de bien-être.\n\n⚠️ *Je ne remplace pas un médecin. En cas d'urgence, appelez le **15** (SAMU).*\n\nComment puis-je vous aider aujourd'hui ?",
};

function renderText(text: string) {
  // Simple markdown bold and italic
  return text
    .split(/(\*\*.*?\*\*|\*.*?\*)/g)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return <span key={i}>{part}</span>;
    });
}

export function HealthChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        role: "assistant",
        content: data.reply || "Désolé, une erreur s'est produite.",
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Erreur de connexion. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const quickQuestions = [
    "J'ai de la fièvre depuis 2 jours",
    "Quels sont les signes d'un AVC ?",
    "Comment gérer le diabète au quotidien ?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir le chatbot santé"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ boxShadow: "0 8px 32px rgba(14,165,233,0.4)" }}
      >
        {open ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
        {unread && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-[var(--border)]"
          style={{ background: "var(--bg)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">SanadiBot</h3>
              <p className="text-white/80 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                Assistant santé IA • Powered by Grok
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-[var(--bg-muted)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]"
                  }`}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>{renderText(line)}</p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-1">
                    <User size={14} className="text-[var(--text-muted)]" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Quick questions (only shown if at start) */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)] text-center">Questions fréquentes :</p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] hover:border-primary-500 hover:bg-primary-500/5 text-[var(--text-muted)] hover:text-primary-600 transition-all"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-[var(--border)] flex gap-2 shrink-0 bg-[var(--bg-muted)]"
          >
            <input
              ref={inputRef}
              type="text"
              className="input-field flex-1 text-sm py-2"
              placeholder="Posez votre question de santé..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-3 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
