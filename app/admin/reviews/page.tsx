"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, EyeOff, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Review {
  id: string; rating: number; comment?: string; hidden: boolean; createdAt: string;
  patient:  { name: string };
  provider: { name: string };
  appointment: { scheduledAt: string; service: { nameFr: string; nameAr?: string } };
}

export default function AdminReviewsPage() {
  const { lang, dir } = useLanguage();
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [showHidden, setShowHidden] = useState(false);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة التقييمات" : isEn ? "Reviews Moderation" : "Modération des Avis",
    subtitle: isAr ? `${total} تقييم إجمالي` : isEn ? `${total} review(s) in total` : `${total} avis au total`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",
    btnHidden: isAr ? "المخفية" : isEn ? "Hidden" : "Masqués",
    btnAll: isAr ? "الكل" : isEn ? "All" : "Tous",
    badgeHidden: isAr ? "مخفي" : isEn ? "Hidden" : "Masqué",
    postedOn: isAr ? "تاريخ النشر" : isEn ? "Posted on" : "Posté le",
    empty: isAr ? "لم يتم العثور على أي تقييم" : isEn ? "No reviews found" : "Aucun avis trouvé",
    confirmDelete: isAr ? "هل أنت تأكد من حذف هذا التقييم؟" : isEn ? "Delete this review permanently?" : "Supprimer définitivement cet avis ?",
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (showHidden) params.set("hidden", "true");
      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [page, showHidden]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const toggleHide = async (id: string, hidden: boolean) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hidden }),
    });
    fetchReviews();
  };

  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);

  const handleDeleteConfirmed = async (id: string) => {
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchReviews();
  };

  const Stars = ({ n }: { n: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHidden(h => !h); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showHidden ? "bg-amber-500 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
            {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showHidden ? L.btnHidden : L.btnAll}
          </button>
          <button onClick={fetchReviews} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className={`card p-4 transition-all ${r.hidden ? "opacity-50 border border-amber-500/30" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Stars n={r.rating} />
                    {r.hidden && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">{L.badgeHidden}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-0.5">
                    {r.patient.name}
                    <span className="text-[var(--text-muted)] font-normal"> → </span>
                    {r.provider.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {isAr ? (r.appointment.service.nameAr || r.appointment.service.nameFr) : r.appointment.service.nameFr} · {new Date(r.appointment.scheduledAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                    <span className="mx-1">·</span>
                    {L.postedOn} {new Date(r.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                  </p>
                  {r.comment && <p className="text-sm text-[var(--text-muted)] italic">"{r.comment}"</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleHide(r.id, !r.hidden)}
                    className={`p-2 rounded-lg transition-colors ${r.hidden ? "hover:bg-emerald-500/10 text-emerald-600" : "hover:bg-amber-500/10 text-amber-600"}`}
                    title={r.hidden ? (isAr ? "إظهار" : "Rétablir") : (isAr ? "إخفاء" : "Masquer")}>
                    {r.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setDeleteConfirm(r)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">Page {page} / {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3"><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-1.5 px-3"><ChevronRight className="w-4 h-4 rtl:rotate-180" /></button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="card max-w-sm w-full p-6 space-y-4 text-start" dir={dir} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{isAr ? "تأكيد حذف التقييم" : "Supprimer cet avis"}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{deleteConfirm.patient.name} → {deleteConfirm.provider.name}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < deleteConfirm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            {deleteConfirm.comment && <p className="text-xs text-[var(--text-muted)] italic">"{deleteConfirm.comment}"</p>}
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isAr ? "هل أنت تأكد من حذف هذا التقييم نهائياً؟ لا يمكن التراجع عن هذا الإجراء." : "Êtes-vous sûr de vouloir supprimer définitivement cet avis ? Cette action est irréversible."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteConfirmed(deleteConfirm.id)}
                className="btn-danger flex-1 text-sm flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                {isAr ? "حذف نهائي" : "Supprimer"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">{isAr ? "إلغاء" : "Annuler"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
