"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, RefreshCw, ChevronLeft, ChevronRight, TrendingUp, Banknote } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Payment {
  id: string; amount: number; status: string; method?: string; createdAt: string;
  appointment: {
    scheduledAt: string;
    patient: { name: string };
    provider: { name: string } | null;
    service: { nameFr: string; nameAr?: string };
  };
}

export default function AdminPaymentsPage() {
  const { lang, dir } = useLanguage();
  const [payments, setPayments]   = useState<Payment[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [revenue, setRevenue]     = useState(0);
  const [commission, setCommission] = useState(0);
  const [commissionRate, setCommissionRate] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إدارة المدفوعات" : isEn ? "Manage Payments" : "Gestion des Paiements",
    subtitle: isAr ? `${total} عملية دفع مسجلة` : isEn ? `${total} payment(s) registered` : `${total} paiement(s) enregistré(s)`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",

    cardRevenue: isAr ? "إجمالي الإيرادات المدفوعة" : isEn ? "Total Revenue (Paid)" : "Revenus Total (payés)",
    cardCommission: isAr ? `عمولة المنصة (${commissionRate}%)` : isEn ? `Platform Commission (${commissionRate}%)` : `Commission Plateforme (${commissionRate}%)`,
    cardProviders: isAr ? `مستحقات مقدمي الرعاية (${100 - commissionRate}%)` : isEn ? `Providers Share (${100 - commissionRate}%)` : `Revenus Providers (${100 - commissionRate}%)`,

    statusAll: isAr ? "الكل" : isEn ? "All" : "Tous",
    statusPaid: isAr ? "مدفوعة" : isEn ? "Paid" : "PAID",
    statusPending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "PENDING",
    statusRefunded: isAr ? "مسترجعة" : isEn ? "Refunded" : "REFUNDED",
    statusFailed: isAr ? "فاشلة" : isEn ? "Failed" : "FAILED",

    thService: isAr ? "الخدمة" : isEn ? "Service" : "Service",
    thPatient: isAr ? "المريض" : isEn ? "Patient" : "Patient",
    thProvider: isAr ? "مقدم الرعاية" : isEn ? "Provider" : "Provider",
    thAmount: isAr ? "المبلغ" : isEn ? "Amount" : "Montant",
    thMethod: isAr ? "طريقة الدفع" : isEn ? "Method" : "Méthode",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thDate: isAr ? "التاريخ" : isEn ? "Date" : "Date",

    empty: isAr ? "لم يتم العثور على أي عملية دفع" : isEn ? "No payments found" : "Aucun paiement trouvé",
  };

  const STATUS_OPTIONS = [
    { key: "ALL", label: L.statusAll },
    { key: "PAID", label: L.statusPaid },
    { key: "PENDING", label: L.statusPending },
    { key: "REFUNDED", label: L.statusRefunded },
    { key: "FAILED", label: L.statusFailed },
  ];

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = statusFilter === "ALL" ? data.payments : data.payments.filter((p: Payment) => p.status === statusFilter);
        setPayments(filtered);
        setTotal(data.total);
        setPages(data.pages);
        setRevenue(data.totalRevenue);
        setCommission(data.commission);
        if (data.commissionRate !== undefined) {
          setCommissionRate(data.commissionRate);
        }
      }
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      PAID: { cls: "badge-confirmed", label: L.statusPaid },
      PENDING: { cls: "badge-pending", label: L.statusPending },
      REFUNDED: { cls: "badge-cancelled", label: L.statusRefunded },
      FAILED: { cls: "badge-cancelled", label: L.statusFailed },
    };
    const item = map[s] || { cls: "badge-pending", label: s };
    return <span className={`${item.cls} text-xs`}>{item.label}</span>;
  };

  const renderMethod = (m?: string) => {
    const method = m?.toUpperCase();
    if (method === "EDAHABIA") return <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs">💳 {isAr ? "الذهبية (Edahabia)" : "Edahabia"}</span>;
    if (method === "CIB") return <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-xs">💳 {isAr ? "بطاقة CIB" : "Carte CIB"}</span>;
    if (method === "CASH") return <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">💵 {isAr ? "نقداً (Cash)" : "Espèces (Cash)"}</span>;
    if (method === "ONLINE") return <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 text-xs">🌐 {isAr ? "دفع إلكتروني" : "En ligne"}</span>;
    return <span className="text-[var(--text-muted)] text-xs">{m || "—"}</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchPayments} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">{L.cardRevenue}</p>
            <p className="text-xl font-extrabold">{revenue.toLocaleString()} DA</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">{L.cardCommission}</p>
            <p className="text-xl font-extrabold">{commission.toLocaleString()} DA</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">{L.cardProviders}</p>
            <p className="text-xl font-extrabold">{(revenue - commission).toLocaleString()} DA</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === key ? "bg-indigo-600 text-white" : "bg-[var(--card-bg)] hover:bg-[var(--hover)]"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thService, L.thPatient, L.thProvider, L.thAmount, L.thMethod, L.thStatus, L.thDate].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3 font-medium">{isAr ? (p.appointment.service.nameAr || p.appointment.service.nameFr) : p.appointment.service.nameFr}</td>
                    <td className="px-4 py-3">{p.appointment.patient.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.appointment.provider?.name || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{p.amount.toLocaleString()} DA</td>
                    <td className="px-4 py-3">{renderMethod(p.method)}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{new Date(p.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}</td>
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
    </div>
  );
}
