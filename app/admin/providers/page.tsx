"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck, Clock, UserX, Search, Filter, RefreshCw,
  CheckCircle2, XCircle, PauseCircle, PlayCircle, Trash2,
  ChevronLeft, ChevronRight, Stethoscope, CalendarDays, Star, MapPin, Mail, Phone,
  AlertTriangle, Eye, FileText,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Provider {
  id: string; name: string; email: string; phone?: string; wilaya?: string;
  approved: boolean; suspended: boolean; adminNotes?: string; avatar?: string;
  specialty?: string; createdAt: string;
  _count: { providerAppointments: number; ownedServices: number; receivedReviews: number };
  documents: { id: string; type: string; status: string }[];
}

export default function AdminProvidersPage() {
  const { lang, dir } = useLanguage();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; label: string } | null>(null);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة مقدمي الرعاية" : isEn ? "Manage Providers" : "Gestion des Providers",
    subtitle: isAr ? `${total} مقدم(و) رعاية مسجل(ون)` : isEn ? `${total} registered provider(s)` : `${total} prestataire(s) enregistré(s)`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",
    searchPh: isAr ? "البحث بالاسم أو البريد الإلكتروني..." : isEn ? "Search by name or email..." : "Rechercher par nom ou email...",
    
    tabAll: isAr ? "الكل" : isEn ? "All" : "Tous",
    tabPending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "En attente",
    tabVerified: isAr ? "المعتمدون" : isEn ? "Verified" : "Vérifiés",
    tabSuspended: isAr ? "المعلقون" : isEn ? "Suspended" : "Suspendus",

    thProvider: isAr ? "مقدم الرعاية" : isEn ? "Provider" : "Provider",
    thContact: isAr ? "التواصل" : isEn ? "Contact" : "Contact",
    thWilaya: isAr ? "الولاية" : isEn ? "Wilaya" : "Wilaya",
    thServices: isAr ? "الخدمات" : isEn ? "Services" : "Services",
    thBookings: isAr ? "المواعيد" : isEn ? "Bookings" : "RDV",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thJoined: isAr ? "تاريخ التسجيل" : isEn ? "Joined" : "Inscrit",
    thActions: isAr ? "الإجراءات" : isEn ? "Actions" : "Actions",

    badgeSuspended: isAr ? "معلق" : isEn ? "Suspended" : "Suspendu",
    badgeVerified: isAr ? "معتمد" : isEn ? "Verified" : "Vérifié",
    badgeRejected: isAr ? "مرفوض" : isEn ? "Rejected" : "Refusé",
    badgePending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "En attente",

    empty: isAr ? "لم يتم العثور على أي مقدم رعاية" : isEn ? "No providers found" : "Aucun provider trouvé",
    
    modalApprove: isAr ? "اعتماد" : isEn ? "Approve" : "Approuver",
    modalReject: isAr ? "رفض" : isEn ? "Reject" : "Refuser",
    modalSuspend: isAr ? "تعليق" : isEn ? "Suspend" : "Suspendre",
    modalReactivate: isAr ? "إعادة تفعيل" : isEn ? "Reactivate" : "Réactiver",
    modalClose: isAr ? "إغلاق" : isEn ? "Close" : "Fermer",
    modalCancel: isAr ? "إلغاء" : isEn ? "Cancel" : "Annuler",
    modalConfirm: isAr ? "تأكيد" : isEn ? "Confirm" : "Confirmer",
    notePlaceholder: isAr ? "ملاحظة المشرف (اختياري)..." : isEn ? "Admin note (optional)..." : "Note admin (optionnelle)...",
  };

  const STATUS_TABS = [
    { key: "ALL", label: L.tabAll, icon: Filter },
    { key: "PENDING", label: L.tabPending, icon: Clock },
    { key: "VERIFIED", label: L.tabVerified, icon: UserCheck },
    { key: "SUSPENDED", label: L.tabSuspended, icon: UserX },
  ];

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/providers?status=${status}&search=${encodeURIComponent(search)}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [status, search, page]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleAction = async (id: string, action: string, adminNotes?: string) => {
    setActionLoading(id + action);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, adminNotes }),
      });
      if (res.ok) { fetchProviders(); setConfirmAction(null); setSelectedProvider(null); }
    } finally { setActionLoading(null); }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<Provider | null>(null);

  const handleDeleteConfirmed = async (id: string) => {
    setActionLoading(id + "delete");
    try {
      await fetch(`/api/admin/providers?id=${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchProviders();
    } finally { setActionLoading(null); }
  };

  const getStatusBadge = (p: Provider) => {
    if (p.suspended) return <span className="badge-cancelled">{L.badgeSuspended}</span>;
    if (p.approved)  return <span className="badge-confirmed">{L.badgeVerified}</span>;
    if (p.adminNotes) return <span className="badge-cancelled">{L.badgeRejected}</span>;
    return <span className="badge-pending">{L.badgePending}</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchProviders} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setStatus(key); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              status === key ? "bg-indigo-600 text-white shadow" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          className="input pl-9 rtl:pr-9 rtl:pl-3 w-full max-w-md"
          placeholder={L.searchPh}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]">
          <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{L.empty}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thProvider, L.thContact, L.thWilaya, L.thServices, L.thBookings, L.thStatus, L.thJoined, L.thActions].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {providers.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          {p.specialty && <p className="text-xs text-[var(--text-muted)]">{p.specialty}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>
                        {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {p.wilaya ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.wilaya}</span> : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{p._count.ownedServices}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{p._count.providerAppointments}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(p)}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {new Date(p.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedProvider(p)}
                          className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                          title="Voir le profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!p.approved && !p.suspended && (
                          <button
                            onClick={() => handleAction(p.id, "approve")}
                            disabled={actionLoading === p.id + "approve"}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                            title={L.modalApprove}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {!p.approved && !p.suspended && (
                          <button
                            onClick={() => setConfirmAction({ id: p.id, action: "reject", label: L.modalReject })}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                            title={L.modalReject}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.approved && !p.suspended && (
                          <button
                            onClick={() => setConfirmAction({ id: p.id, action: "suspend", label: L.modalSuspend })}
                            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors"
                            title={L.modalSuspend}
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.suspended && (
                          <button
                            onClick={() => handleAction(p.id, "reactivate")}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                            title={L.modalReactivate}
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Page {page} / {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3">
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-1.5 px-3">
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedProvider(null)}>
          <div className="card max-w-lg w-full p-6 space-y-4 text-start" dir={dir} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedProvider.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedProvider.name}</h3>
                <p className="text-[var(--text-muted)] text-sm">{selectedProvider.specialty || (isAr ? "مقدم رعاية" : "Prestataire de santé")}</p>
                {getStatusBadge(selectedProvider)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "البريد" : "Email"}</p><p className="font-medium">{selectedProvider.email}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "الهاتف" : "Téléphone"}</p><p className="font-medium">{selectedProvider.phone || "—"}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "الولاية" : "Wilaya"}</p><p className="font-medium">{selectedProvider.wilaya || "—"}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "تاريخ التسجيل" : "Inscrit le"}</p><p className="font-medium">{new Date(selectedProvider.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</p></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="card p-2"><p className="text-lg font-bold">{selectedProvider._count.ownedServices}</p><p className="text-xs text-[var(--text-muted)]">{L.thServices}</p></div>
              <div className="card p-2"><p className="text-lg font-bold">{selectedProvider._count.providerAppointments}</p><p className="text-xs text-[var(--text-muted)]">{L.thBookings}</p></div>
              <div className="card p-2"><p className="text-lg font-bold">{selectedProvider._count.receivedReviews}</p><p className="text-xs text-[var(--text-muted)]">{isAr ? "التقييمات" : "Avis"}</p></div>
            </div>

            {selectedProvider.adminNotes && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                <p className="text-amber-700 dark:text-amber-300 font-medium text-xs mb-1">{isAr ? "ملاحظة المشرف" : "Note admin"}</p>
                <p>{selectedProvider.adminNotes}</p>
              </div>
            )}

            {/* Documents */}
            {selectedProvider.documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{isAr ? "الوثائق" : "Documents"} ({selectedProvider.documents.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedProvider.documents.map(doc => (
                    <span key={doc.id} className={`px-2 py-1 rounded-lg text-xs font-medium ${doc.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : doc.status === "REJECTED" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {doc.type} — {doc.status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              {!selectedProvider.approved && !selectedProvider.suspended && (
                <>
                  <button onClick={() => handleAction(selectedProvider.id, "approve")} className="btn-primary flex-1 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {L.modalApprove}
                  </button>
                  <button onClick={() => { setNoteInput(""); setConfirmAction({ id: selectedProvider.id, action: "reject", label: L.modalReject }); }} className="btn-danger flex-1 text-sm">
                    <XCircle className="w-4 h-4" /> {L.modalReject}
                  </button>
                </>
              )}
              {selectedProvider.approved && !selectedProvider.suspended && (
                <button onClick={() => setConfirmAction({ id: selectedProvider.id, action: "suspend", label: L.modalSuspend })} className="btn-danger flex-1 text-sm">
                  <PauseCircle className="w-4 h-4" /> {L.modalSuspend}
                </button>
              )}
              {selectedProvider.suspended && (
                <button onClick={() => handleAction(selectedProvider.id, "reactivate")} className="btn-primary flex-1 text-sm">
                  <PlayCircle className="w-4 h-4" /> {L.modalReactivate}
                </button>
              )}
              <button onClick={() => setSelectedProvider(null)} className="btn-secondary text-sm">{L.modalClose}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 space-y-4 text-start" dir={dir}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-bold">{confirmAction.label}</h3>
                <p className="text-sm text-[var(--text-muted)]">{isAr ? "سيتم تسجيل هذا الإجراء في سجل المراجعة." : "Cette action sera enregistrée dans le journal d'audit."}</p>
              </div>
            </div>
            <textarea
              className="input w-full h-20 text-sm resize-none"
              placeholder={L.notePlaceholder}
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => handleAction(confirmAction.id, confirmAction.action, noteInput)} className="btn-danger flex-1 text-sm">
                {L.modalConfirm}
              </button>
              <button onClick={() => setConfirmAction(null)} className="btn-secondary flex-1 text-sm">{L.modalCancel}</button>
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
                <h3 className="font-bold text-base">{isAr ? "تأكيد حذف الحساب" : "Confirmer la suppression"}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{deleteConfirm.name}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isAr ? "هل أنت تأكد من حذف حساب مقدم الرعاية هذا نهائياً؟ لا يمكن التراجع عن هذا الإجراء." : "Êtes-vous sûr de vouloir supprimer définitivement ce compte ? Cette action est irréversible."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteConfirmed(deleteConfirm.id)}
                disabled={actionLoading === deleteConfirm.id + "delete"}
                className="btn-danger flex-1 text-sm flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                {isAr ? "حذف نهائي" : "Supprimer"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">{L.modalCancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

