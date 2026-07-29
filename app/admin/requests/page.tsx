"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Search, Filter, RefreshCw, MapPin, Calendar,
  AlertTriangle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Eye,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ServiceRequest {
  id: string; description: string; address: string; scheduledAt: string;
  urgency: string; status: string; createdAt: string;
  patient: { id: string; name: string; email: string; wilaya?: string };
  service: { id: string; nameFr: string; nameAr?: string; category: string };
  responses: { id: string; status: string; provider: { id: string; name: string } }[];
}

const urgencyColors: Record<string, string> = {
  NORMAL: "bg-gray-500/10 text-gray-600", URGENT: "bg-red-500/10 text-red-600",
};

export default function AdminRequestsPage() {
  const { lang, dir } = useLanguage();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة طلبات الخدمة" : isEn ? "Manage Service Requests" : "Gestion des Demandes",
    subtitle: isAr ? `${total} طلب خدمة مسجل` : isEn ? `${total} service request(s)` : `${total} demande(s) de service`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",

    statusAll: isAr ? "الكل" : isEn ? "All" : "ALL",
    statusPending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "PENDING",
    statusAccepted: isAr ? "مقبولة" : isEn ? "Accepted" : "ACCEPTED",
    statusRefused: isAr ? "مرفوضة" : isEn ? "Refused" : "REFUSED",
    statusClosed: isAr ? "مغلقة" : isEn ? "Closed" : "CLOSED",
    statusCancelled: isAr ? "ملغاة" : isEn ? "Cancelled" : "CANCELLED",

    thPatient: isAr ? "المريض" : isEn ? "Patient" : "Patient",
    thService: isAr ? "الخدمة" : isEn ? "Service" : "Service",
    thAddress: isAr ? "العنوان" : isEn ? "Address" : "Adresse",
    thDate: isAr ? "التاريخ المطلوب" : isEn ? "Scheduled Date" : "Date souhaitée",
    thUrgency: isAr ? "الاستعجال" : isEn ? "Urgency" : "Urgence",
    thResponses: isAr ? "الردود" : isEn ? "Responses" : "Réponses",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thCreated: isAr ? "تاريخ الطلب" : isEn ? "Created At" : "Créée le",
    thActions: isAr ? "الإجراءات" : isEn ? "Actions" : "Actions",

    urgNormal: isAr ? "عادي" : isEn ? "Normal" : "NORMAL",
    urgUrgent: isAr ? "عاجل" : isEn ? "Urgent" : "URGENT",

    empty: isAr ? "لم يتم العثور على أي طلب" : isEn ? "No requests found" : "Aucune demande trouvée",
    
    modalDesc: isAr ? "الوصف" : isEn ? "Description" : "Description",
    modalResponses: isAr ? "ردود مقدمي الرعاية" : isEn ? "Provider responses" : "Réponses des prestataires",
    modalCancelBtn: isAr ? "إلغاء الطلب" : isEn ? "Cancel Request" : "Annuler",
    modalCloseBtn: isAr ? "إغلاق الطلب" : isEn ? "Close Request" : "Clôturer",
    modalExitBtn: isAr ? "إغلاق" : isEn ? "Close" : "Fermer",
  };

  const STATUS_OPTIONS = [
    { key: "ALL", label: L.statusAll },
    { key: "PENDING", label: L.statusPending },
    { key: "ACCEPTED", label: L.statusAccepted },
    { key: "REFUSED", label: L.statusRefused },
    { key: "CLOSED", label: L.statusClosed },
    { key: "CANCELLED", label: L.statusCancelled },
  ];

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests?status=${status}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchRequests(); setSelected(null);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      PENDING: { cls: "badge-pending", label: L.statusPending },
      ACCEPTED: { cls: "badge-confirmed", label: L.statusAccepted },
      REFUSED: { cls: "badge-cancelled", label: L.statusRefused },
      CLOSED: { cls: "badge-completed", label: L.statusClosed },
      CANCELLED: { cls: "badge-cancelled", label: L.statusCancelled },
    };
    const item = map[s] || { cls: "badge-pending", label: s };
    return <span className={item.cls}>{item.label}</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchRequests} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => { setStatus(key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${status === key ? "bg-indigo-600 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : requests.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]"><ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thPatient, L.thService, L.thAddress, L.thDate, L.thUrgency, L.thResponses, L.thStatus, L.thCreated, L.thActions].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r.patient.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{r.patient.wilaya}</p>
                    </td>
                    <td className="px-4 py-3">{isAr ? (r.service.nameAr || r.service.nameFr) : r.service.nameFr}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs max-w-[120px] truncate">{r.address}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{new Date(r.scheduledAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyColors[r.urgency] || ""}`}>
                        {r.urgency === "URGENT" ? L.urgUrgent : L.urgNormal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{r.responses.length}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{new Date(r.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full p-6 space-y-4 text-start" dir={dir} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{isAr ? (selected.service.nameAr || selected.service.nameFr) : selected.service.nameFr}</h3>
                <p className="text-[var(--text-muted)] text-sm">{selected.patient.name}</p>
              </div>
              {statusBadge(selected.status)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[var(--text-muted)] text-xs">{L.thAddress}</p><p>{selected.address}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.thDate}</p><p>{new Date(selected.scheduledAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.thUrgency}</p><p className="font-medium">{selected.urgency === "URGENT" ? L.urgUrgent : L.urgNormal}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.thResponses}</p><p>{selected.responses.length} provider(s)</p></div>
            </div>
            <div><p className="text-[var(--text-muted)] text-xs mb-1">{L.modalDesc}</p><p className="text-sm">{selected.description}</p></div>
            {selected.responses.length > 0 && (
              <div>
                <p className="text-[var(--text-muted)] text-xs mb-2">{L.modalResponses}</p>
                {selected.responses.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 bg-[var(--hover)] rounded-lg mb-1">
                    <span className="text-sm font-medium">{r.provider.name}</span>
                    {statusBadge(r.status)}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              {selected.status === "PENDING" && (
                <button onClick={() => handleStatusChange(selected.id, "CANCELLED")} className="btn-danger flex-1 text-sm">{L.modalCancelBtn}</button>
              )}
              {selected.status !== "CLOSED" && (
                <button onClick={() => handleStatusChange(selected.id, "CLOSED")} className="btn-secondary flex-1 text-sm">{L.modalCloseBtn}</button>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">{L.modalExitBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
