"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Stethoscope, Search, Star, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Edit3, Check, X, Banknote, Clock,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Service {
  id: string; nameFr: string; name: string; nameAr?: string; category: string;
  price: number; duration: number; active: boolean; featured: boolean;
  wilaya?: string; createdAt: string;
  provider?: { id: string; name: string; wilaya?: string };
  _count: { appointments: number };
}

export default function AdminServicesPage() {
  const { lang, dir } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterInactive, setFilterInactive] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, active: true, featured: false });

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة الخدمات" : isEn ? "Manage Services" : "Gestion des Services",
    subtitle: isAr ? `${total} خدمة في الكتالوج` : isEn ? `${total} service(s) in catalog` : `${total} service(s) dans le catalogue`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",
    searchPh: isAr ? "البحث عن خدمة..." : isEn ? "Search service..." : "Rechercher...",
    
    featuredFilter: isAr ? "المميزة" : isEn ? "Featured" : "Featured",
    inactiveFilter: isAr ? "غير النشطة" : isEn ? "Inactive" : "Inactifs",

    thService: isAr ? "الخدمة" : isEn ? "Service" : "Service",
    thCategory: isAr ? "الفئة" : isEn ? "Category" : "Catégorie",
    thProvider: isAr ? "مقدم الرعاية" : isEn ? "Provider" : "Provider",
    thPrice: isAr ? "السعر" : isEn ? "Price" : "Prix",
    thDuration: isAr ? "المدة" : isEn ? "Duration" : "Durée",
    thBookings: isAr ? "المواعيد" : isEn ? "Appointments" : "RDV",
    thActive: isAr ? "نشطة" : isEn ? "Active" : "Actif",
    thFeatured: isAr ? "مميزة" : isEn ? "Featured" : "Featured",
    thActions: isAr ? "الإجراءات" : isEn ? "Actions" : "Actions",

    platform: isAr ? "المنصة" : isEn ? "Platform" : "Plateforme",
    empty: isAr ? "لم يتم العثور على أي خدمة" : isEn ? "No services found" : "Aucun service trouvé",
    
    editTitle: isAr ? "تعديل الخدمة" : isEn ? "Edit Service" : "Modifier",
    priceLabel: isAr ? "السعر (دج)" : isEn ? "Price (DA)" : "Prix (DA)",
    activeLabel: isAr ? "نشطة" : isEn ? "Active" : "Actif",
    featuredLabel: isAr ? "مميزة" : isEn ? "Featured" : "Featured",
    saveBtn: isAr ? "حفظ" : isEn ? "Save" : "Enregistrer",
    cancelBtn: isAr ? "إلغاء" : isEn ? "Cancel" : "Annuler",
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search });
      if (filterFeatured) params.set("featured", "true");
      if (filterInactive) params.set("active", "false");
      const res = await fetch(`/api/admin/services?${params}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [page, search, filterFeatured, filterInactive]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const toggleField = async (id: string, field: "active" | "featured", value: boolean) => {
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    fetchServices();
  };

  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);

  const handleDeleteConfirmed = async (id: string) => {
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchServices();
  };

  const handleEditSave = async () => {
    if (!editService) return;
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editService.id, price: editForm.price, active: editForm.active, featured: editForm.featured }),
    });
    setEditService(null);
    fetchServices();
  };

  const categoryColors: Record<string, string> = {
    HOME_CARE:    "bg-indigo-500/10 text-indigo-600",
    TELEMEDICINE: "bg-emerald-500/10 text-emerald-600",
    COORDINATION: "bg-purple-500/10 text-purple-600",
    WELLBEING:    "bg-pink-500/10 text-pink-600",
    DAILY_SUPPORT:"bg-amber-500/10 text-amber-600",
  };
  const categoryLabels: Record<string, string> = {
    HOME_CARE: isAr ? "رعاية منزلية" : "Soins à domicile",
    TELEMEDICINE: isAr ? "استشارة عن بعد" : "Télémédecine",
    COORDINATION: isAr ? "تنسيق الرعاية" : "Coordination",
    WELLBEING: isAr ? "عافية وصحة" : "Bien-être",
    DAILY_SUPPORT: isAr ? "دعم يومي" : "Assistance",
  };

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchServices} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input className="input pl-9 rtl:pr-9 rtl:pl-3 w-64" placeholder={L.searchPh} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button onClick={() => setFilterFeatured(f => !f)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filterFeatured ? "bg-yellow-500 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
          <Star className="w-3.5 h-3.5" /> {L.featuredFilter}
        </button>
        <button onClick={() => setFilterInactive(f => !f)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterInactive ? "bg-red-500 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
          {L.inactiveFilter}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]"><Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thService, L.thCategory, L.thProvider, L.thPrice, L.thDuration, L.thBookings, L.thActive, L.thFeatured, L.thActions].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3 font-semibold">{isAr ? (s.nameAr || s.nameFr) : s.nameFr}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[s.category] || "bg-gray-500/10 text-gray-600"}`}>
                        {categoryLabels[s.category] || s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{s.provider?.name || L.platform}</td>
                    <td className="px-4 py-3 font-medium">{s.price.toLocaleString()} DA</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{s.duration > 0 ? `${s.duration} ${isAr ? "دقيقة" : "min"}` : "—"}</td>
                    <td className="px-4 py-3 text-center font-medium">{s._count.appointments}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(s.id, "active", !s.active)}
                        className={`w-10 h-5 rounded-full transition-all relative ${s.active ? "bg-emerald-500" : "bg-[var(--border)]"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${s.active ? "left-5 rtl:right-5 rtl:left-auto" : "left-0.5 rtl:right-0.5 rtl:left-auto"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(s.id, "featured", !s.featured)}
                        className={`w-10 h-5 rounded-full transition-all relative ${s.featured ? "bg-yellow-500" : "bg-[var(--border)]"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${s.featured ? "left-5 rtl:right-5 rtl:left-auto" : "left-0.5 rtl:right-0.5 rtl:left-auto"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditService(s); setEditForm({ price: s.price, active: s.active, featured: s.featured }); }}
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-600 transition-colors" title="Modifier">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(s)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Page {page} / {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3"><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-1.5 px-3"><ChevronRight className="w-4 h-4 rtl:rotate-180" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setEditService(null)}>
          <div className="card max-w-sm w-full p-6 space-y-4 text-start" dir={dir} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{L.editTitle} — {isAr ? (editService.nameAr || editService.nameFr) : editService.nameFr}</h3>
            <div>
              <label className="label">{L.priceLabel}</label>
              <input type="number" className="input w-full" value={editForm.price}
                onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm font-medium">{L.activeLabel}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.featured} onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm font-medium">{L.featuredLabel}</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleEditSave} className="btn-primary flex-1 text-sm">{L.saveBtn}</button>
              <button onClick={() => setEditService(null)} className="btn-secondary flex-1 text-sm">{L.cancelBtn}</button>
            </div>
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
                <h3 className="font-bold text-base">{isAr ? "تأكيد حذف الخدمة" : "Confirmer la suppression"}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{isAr ? (deleteConfirm.nameAr || deleteConfirm.nameFr) : deleteConfirm.nameFr}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isAr ? "هل أنت تأكد من حذف هذه الخدمة نهائياً من الكتالوج؟ لا يمكن التراجع عن هذا الإجراء." : "Êtes-vous sûr de vouloir supprimer définitivement ce service ? Cette action est irréversible."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteConfirmed(deleteConfirm.id)}
                className="btn-danger flex-1 text-sm flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                {isAr ? "حذف نهائي" : "Supprimer"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">{L.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
