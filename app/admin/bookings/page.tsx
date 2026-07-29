"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, RefreshCw, ChevronLeft, ChevronRight, MapPin, Eye, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Appointment {
  id: string; status: string; scheduledAt: string; address?: string; notes?: string; createdAt: string;
  patient: { id: string; name: string; email: string; phone?: string };
  provider: { id: string; name: string; email: string } | null;
  service: { nameFr: string; nameAr?: string; price: number; category: string };
  payment: { id: string; amount: number; status: string; method?: string } | null;
}

export default function AdminBookingsPage() {
  const { lang, dir } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة المواعيد" : isEn ? "Manage Appointments" : "Gestion des Rendez-vous",
    subtitle: isAr ? `${total} موعد مسجل` : isEn ? `${total} appointment(s) registered` : `${total} rendez-vous enregistrés`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",

    statusAll: isAr ? "الكل" : isEn ? "All" : "Tous",
    statusPending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "PENDING",
    statusConfirmed: isAr ? "مؤكدة" : isEn ? "Confirmed" : "CONFIRMED",
    statusCompleted: isAr ? "مكتملة" : isEn ? "Completed" : "COMPLETED",
    statusCancelled: isAr ? "ملغاة" : isEn ? "Cancelled" : "CANCELLED",

    thPatient: isAr ? "المريض" : isEn ? "Patient" : "Patient",
    thService: isAr ? "الخدمة" : isEn ? "Service" : "Service",
    thProvider: isAr ? "مقدم الرعاية" : isEn ? "Provider" : "Provider",
    thDate: isAr ? "تاريخ الموعد" : isEn ? "Appointment Date" : "Date RDV",
    thPayment: isAr ? "الدفع" : isEn ? "Payment" : "Paiement",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thActions: isAr ? "الإجراءات" : isEn ? "Actions" : "Actions",

    empty: isAr ? "لم يتم العثور على أي موعد" : isEn ? "No appointments found" : "Aucun rendez-vous trouvé",
    
    modalAddress: isAr ? "العنوان" : isEn ? "Address" : "Adresse",
    modalNotes: isAr ? "ملاحظات" : isEn ? "Notes" : "Notes",
    modalPayment: isAr ? "تفاصيل الدفع" : isEn ? "Payment details" : "Paiement",
    modalCancelBtn: isAr ? "إلغاء الموعد" : isEn ? "Cancel Appointment" : "Annuler",
    modalCloseBtn: isAr ? "إغلاق" : isEn ? "Close" : "Fermer",
  };

  const STATUS_OPTIONS = [
    { key: "ALL", label: L.statusAll },
    { key: "PENDING", label: L.statusPending },
    { key: "CONFIRMED", label: L.statusConfirmed },
    { key: "COMPLETED", label: L.statusCompleted },
    { key: "CANCELLED", label: L.statusCancelled },
  ];

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?status=${status}&page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch("/api/admin/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchAppointments(); setSelected(null);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      PENDING: { cls: "badge-pending", label: L.statusPending },
      CONFIRMED: { cls: "badge-confirmed", label: L.statusConfirmed },
      COMPLETED: { cls: "badge-completed", label: L.statusCompleted },
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
        <button onClick={fetchAppointments} className="btn-secondary flex items-center gap-2 text-sm">
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
      ) : appointments.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]"><CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thPatient, L.thService, L.thProvider, L.thDate, L.thPayment, L.thStatus, L.thActions].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{a.patient.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{a.patient.email}</p>
                    </td>
                    <td className="px-4 py-3">{isAr ? (a.service.nameAr || a.service.nameFr) : a.service.nameFr}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{a.provider?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(a.scheduledAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      {a.payment
                        ? <span className={a.payment.status === "PAID" ? "badge-confirmed text-xs" : "badge-pending text-xs"}>{a.payment.status}</span>
                        : <span className="text-[var(--text-muted)] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(a)} className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-600 transition-colors">
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
                <p className="text-[var(--text-muted)] text-sm">{selected.service.price.toLocaleString()} DA</p>
              </div>
              {statusBadge(selected.status)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[var(--text-muted)] text-xs">{L.thPatient}</p><p className="font-medium">{selected.patient.name}</p><p className="text-xs text-[var(--text-muted)]">{selected.patient.phone || selected.patient.email}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.thProvider}</p><p className="font-medium">{selected.provider?.name || (isAr ? "غير معين" : "Non assigné")}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.thDate}</p><p>{new Date(selected.scheduledAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", { dateStyle: "full" })}</p></div>
              <div><p className="text-[var(--text-muted)] text-xs">{L.modalAddress}</p><p className="text-xs">{selected.address || "—"}</p></div>
            </div>
            {selected.notes && <div><p className="text-[var(--text-muted)] text-xs mb-1">{L.modalNotes}</p><p className="text-sm">{selected.notes}</p></div>}
            {selected.payment && (
              <div className="p-3 bg-[var(--hover)] rounded-xl text-sm">
                <p className="font-medium text-xs text-[var(--text-muted)] mb-1">{L.modalPayment}</p>
                <div className="flex items-center justify-between">
                  <span>{selected.payment.amount.toLocaleString()} DA — {selected.payment.method || "N/A"}</span>
                  {statusBadge(selected.payment.status)}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              {selected.status === "PENDING" && (
                <button onClick={() => handleStatusChange(selected.id, "CANCELLED")} className="btn-danger flex-1 text-sm">{L.modalCancelBtn}</button>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">{L.modalCloseBtn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
