"use client";
import { useState } from "react";
import { X, Star, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ReviewModalProps {
  appointmentId: string;
  providerName: string;
  onClose: () => void;
  onSuccess: (review: any) => void;
}

export function ReviewModal({ appointmentId, providerName, onClose, onSuccess }: ReviewModalProps) {
  const { lang } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");

      onSuccess(data.review);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-[var(--bg)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {lang === "ar" ? "تقييم الخدمة" : lang === "en" ? "Leave a Review" : "Évaluer le service"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-[var(--text-muted)] text-sm mb-2">
              {lang === "ar" ? "كيف كانت تجربتك مع" : lang === "en" ? "How was your experience with" : "Comment s'est passée votre expérience avec"}
              <br />
              <span className="font-bold text-[var(--text)]">{providerName}</span> ?
            </p>
            <div className="flex items-center justify-center gap-2 mt-4" style={{ flexDirection: "row" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star size={32} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === "ar" ? "تعليق إضافي (اختياري)" : lang === "en" ? "Additional comment (optional)" : "Commentaire (optionnel)"}
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder={lang === "ar" ? "اكتب رأيك هنا..." : lang === "en" ? "Write your feedback..." : "Écrivez votre avis..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                lang === "ar" ? "إرسال التقييم" : lang === "en" ? "Submit Review" : "Envoyer l'évaluation"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
