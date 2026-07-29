"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, PauseCircle, PlayCircle, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, Mail, Phone, MapPin, Eye,
  CalendarDays, FileText, ClipboardList,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Patient {
  id: string; name: string; email: string; phone?: string; wilaya?: string;
  suspended: boolean; adminNotes?: string; avatar?: string; createdAt: string;
  _count: { patientAppointments: number; patientRecords: number; serviceRequests: number };
}

export default function AdminPatientsPage() {
  const { lang, dir } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Patient | null>(null);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة المرضى" : isEn ? "Manage Patients" : "Gestion des Patients",
    subtitle: isAr ? `${total} مريض مسجل` : isEn ? `${total} registered patient(s)` : `${total} patient(s) enregistré(s)`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",
    searchPh: isAr ? "البحث بالاسم أو البريد..." : isEn ? "Search by name or email..." : "Rechercher...",
    
    tabAll: isAr ? "الكل" : isEn ? "All" : "Tous",
    tabActive: isAr ? "النشطون" : isEn ? "Active" : "Actifs",
    tabSuspended: isAr ? "المعلقون" : isEn ? "Suspended" : "Suspendus",

    thPatient: isAr ? "المريض" : isEn ? "Patient" : "Patient",
    thContact: isAr ? "التواصل" : isEn ? "Contact" : "Contact",
    thWilaya: isAr ? "الولاية" : isEn ? "Wilaya" : "Wilaya",
    thBookings: isAr ? "المواعيد" : isEn ? "Appointments" : "RDV",
    thRecords: isAr ? "الملفات" : isEn ? "Records" : "Dossiers",
    thRequests: isAr ? "الطلبات" : isEn ? "Requests" : "Demandes",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thJoined: isAr ? "تاريخ التسجيل" : isEn ? "Joined" : "Inscrit",
    thActions: isAr ? "الإجراءات" : isEn ? "Actions" : "Actions",

    badgeActive: isAr ? "نشط" : isEn ? "Active" : "Actif",
    badgeSuspended: isAr ? "معلق" : isEn ? "Suspended" : "Suspendu",

    empty: isAr ? "لم يتم العثور على أي مريض" : isEn ? "No patients found" : "Aucun patient trouvé",
    
    modalSuspend: isAr ? "تعليق الحساب" : isEn ? "Suspend Account" : "Suspendre",
    modalReactivate: isAr ? "إعادة تفعيل الحساب" : isEn ? "Reactivate Account" : "Réactiver",
    modalClose: isAr ? "إغلاق" : isEn ? "Close" : "Fermer",
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/patients?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id + action);
    try {
      const res = await fetch("/api/admin/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) { fetchPatients(); setSelected(null); }
    } finally { setActionLoading(null); }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);

  const handleDeleteConfirmed = async (id: string) => {
    setActionLoading(id + "delete");
    try {
      await fetch(`/api/admin/patients?id=${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchPatients();
    } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchPatients} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {[{ key: "ALL", label: L.tabAll }, { key: "ACTIVE", label: L.tabActive }, { key: "SUSPENDED", label: L.tabSuspended }].map(({ key, label }) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === key ? "bg-indigo-600 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input className="input pl-9 rtl:pr-9 rtl:pl-3 w-full" placeholder={L.searchPh} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : patients.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thPatient, L.thContact, L.thWilaya, L.thBookings, L.thRecords, L.thRequests, L.thStatus, L.thJoined, L.thActions].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>
                        {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.wilaya || "—"}</td>
                    <td className="px-4 py-3 text-center font-medium">{p._count.patientAppointments}</td>
                    <td className="px-4 py-3 text-center font-medium">{p._count.patientRecords}</td>
                    <td className="px-4 py-3 text-center font-medium">{p._count.serviceRequests}</td>
                    <td className="px-4 py-3">
                      {p.suspended ? <span className="badge-cancelled">{L.badgeSuspended}</span> : <span className="badge-confirmed">{L.badgeActive}</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{new Date(p.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(p)} className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--text-muted)] hover:text-indigo-600 transition-colors" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        {p.suspended ? (
                          <button onClick={() => handleAction(p.id, "reactivate")} disabled={actionLoading === p.id + "reactivate"} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors" title={L.modalReactivate}>
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleAction(p.id, "suspend")} disabled={actionLoading === p.id + "suspend"} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors" title={L.modalSuspend}>
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Supprimer">
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

      {/* Patient Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-md w-full p-6 space-y-4 text-start" dir={dir} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selected.name}</h3>
                <p className="text-[var(--text-muted)] text-sm">{selected.email}</p>
                {selected.suspended ? <span className="badge-cancelled">{L.badgeSuspended}</span> : <span className="badge-confirmed">{L.badgeActive}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "الهاتف" : "Téléphone"}</p><p>{selected.phone || "—"}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "الولاية" : "Wilaya"}</p><p>{selected.wilaya || "—"}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{isAr ? "تاريخ التسجيل" : "Inscrit le"}</p><p>{new Date(selected.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="card p-2"><p className="text-lg font-bold">{selected._count.patientAppointments}</p><p className="text-xs text-[var(--text-muted)]">{L.thBookings}</p></div>
              <div className="card p-2"><p className="text-lg font-bold">{selected._count.patientRecords}</p><p className="text-xs text-[var(--text-muted)]">{L.thRecords}</p></div>
              <div className="card p-2"><p className="text-lg font-bold">{selected._count.serviceRequests}</p><p className="text-xs text-[var(--text-muted)]">{L.thRequests}</p></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              {selected.suspended
                ? <button onClick={() => handleAction(selected.id, "reactivate")} className="btn-primary flex-1 text-sm">{L.modalReactivate}</button>
                : <button onClick={() => handleAction(selected.id, "suspend")} className="btn-danger flex-1 text-sm">{L.modalSuspend}</button>
              }
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">{L.modalClose}</button>
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
                <h3 className="font-bold text-base">{isAr ? "تأكيد حذف حساب المريض" : "Confirmer la suppression"}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{deleteConfirm.name}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isAr ? "هل أنت تأكد من حذف حساب المريض هذا نهائياً؟ لا يمكن التراجع عن هذا الإجراء." : "Êtes-vous sûr de vouloir supprimer définitivement ce patient ? Cette action est irréversible."}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteConfirmed(deleteConfirm.id)}
                disabled={actionLoading === deleteConfirm.id + "delete"}
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
