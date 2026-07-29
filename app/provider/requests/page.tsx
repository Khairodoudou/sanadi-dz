"use client";
import { useEffect, useState } from "react";
import {
  Clock, CheckCircle, XCircle, User, MapPin, Stethoscope,
  AlertCircle, Filter, Phone, ChevronDown, Calendar, Banknote, MessageSquare, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ChatWindow } from "@/components/chat/ChatWindow";

type Appointment = {
  id: string;
  status: string;
  scheduledAt: string;
  address: string;
  notes: string;
  service: { name: string; nameFr: string; nameAr: string; price: number };
  patient: { name: string; phone: string; wilaya: string };
  payment?: { id: string; status: string; method?: string; amount?: number } | null;
};

const statusConfig: Record<string, { labelKey: string; cls: string; icon: React.ElementType }> = {
  PENDING:   { labelKey: "pending",   cls: "badge-pending",   icon: Clock },
  CONFIRMED: { labelKey: "confirmed", cls: "badge-confirmed", icon: CheckCircle },
  COMPLETED: { labelKey: "completed", cls: "badge-completed", icon: CheckCircle },
  CANCELLED: { labelKey: "cancelled", cls: "badge-cancelled", icon: XCircle },
};

export default function ProviderRequestsPage() {
  const { t, lang } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [chatApt, setChatApt] = useState<Appointment | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => {
        setAppointments(d.appointments || []);
        if (d.currentUserId) setCurrentUserId(d.currentUserId);
        setLoading(false);
      });
  }, []);



  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { appointment } = await res.json();
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: appointment.status, payment: appointment.payment || a.payment } : a)));
    }
    setUpdating(null);
  };

  const counts = {
    ALL: appointments.length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    CONFIRMED: appointments.filter((a) => a.status === "CONFIRMED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: appointments.filter((a) => a.status === "CANCELLED").length,
  };

  const filtered = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);

  const filterTabs = [
    { key: "ALL", label: lang === "ar" ? "الكل" : lang === "en" ? "All" : "Tous" },
    { key: "PENDING", label: t("pending") },
    { key: "CONFIRMED", label: t("confirmed") },
    { key: "COMPLETED", label: t("completed") },
    { key: "CANCELLED", label: t("cancelled") },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">{t("prov_req_title")}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            {counts.PENDING > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {counts.PENDING} {lang === "ar" ? "طلب يحتاج ردًّا" : lang === "en" ? "request(s) need a response" : "demande(s) en attente de réponse"}
              </span>
            ) : (
              `${appointments.length} ${lang === "ar" ? "طلب إجمالي" : lang === "en" ? "requests total" : "demande(s) au total"}`
            )}
          </p>
        </div>
        {/* Revenue summary */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
          <Banknote size={16} className="text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-[10px] text-[var(--text-muted)] leading-none">{lang === "ar" ? "الإيرادات المكتسبة" : "Revenus générés"}</p>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              {appointments.filter(a => a.status === "COMPLETED").reduce((s, a) => s + a.service.price, 0).toLocaleString()} DZD
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter size={14} className="text-[var(--text-muted)] shrink-0" />
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === key
                ? "bg-primary-600 text-white shadow-md"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              filter === key ? "bg-white/20 text-white" : "bg-[var(--bg-muted)]"
            }`}>
              {counts[key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-[var(--bg-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <AlertCircle size={44} className="mx-auto mb-3 text-[var(--text-muted)] opacity-30" />
          <p className="font-semibold text-sm">{t("prov_req_no_req")}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {filter !== "ALL"
              ? lang === "ar" ? "لا توجد طلبات في هذه الفئة." : "Aucune demande dans cette catégorie."
              : lang === "ar" ? "لم يصل بعد أي طلب." : "Aucune demande reçue pour l'instant."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const cfg = statusConfig[apt.status] || statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            const isPending = apt.status === "PENDING";
            const isConfirmed = apt.status === "CONFIRMED";
            const serviceName = lang === "ar" ? apt.service.nameAr : lang === "en" ? apt.service.name : apt.service.nameFr;
            const aptDate = new Date(apt.scheduledAt);
            const today = new Date();
            const isToday = aptDate.toDateString() === today.toDateString();

            return (
              <div
                key={apt.id}
                className={`card hover:shadow-xl transition-all duration-300 ${
                  isPending ? "border-s-4 border-s-amber-400 dark:border-s-amber-500" :
                  isConfirmed ? "border-s-4 border-s-emerald-400" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center shrink-0 font-extrabold text-primary-600 dark:text-primary-400 text-lg">
                    {apt.patient.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-extrabold text-base">{apt.patient.name}</p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Phone size={11} />{apt.patient.phone || "—"}
                          {apt.patient.wilaya && (
                            <><span className="opacity-40">·</span><MapPin size={11} />{apt.patient.wilaya}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {isToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                            {lang === "ar" ? "اليوم" : "Aujourd'hui"}
                          </span>
                        )}
                        {((apt.payment && apt.payment.status === "PAID") || apt.status === "COMPLETED") && (
                          (() => {
                            const method = apt.payment?.method?.toUpperCase() || "";
                            const isOnline = ["CIB", "EDAHABIA", "ONLINE", "CARD"].includes(method);
                            return (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck size={10} />
                                {isOnline ? (
                                  <>
                                    {lang === "ar" ? "مدفوع (دفع إلكتروني)" : lang === "en" ? "Paid (Online)" : "Payé (En ligne)"}
                                    <span className="opacity-70">· {method === "EDAHABIA" ? (lang === "ar" ? "الذهبية" : "Edahabia") : "CIB"}</span>
                                  </>
                                ) : (
                                  <>
                                    {lang === "ar" ? "مدفوع نقداً (Cash)" : lang === "en" ? "Paid (Cash)" : "Payé en espèces (Cash)"}
                                  </>
                                )}
                              </span>
                            );
                          })()
                        )}
                        <span className={`badge ${cfg.cls} flex items-center gap-1`}>
                          <StatusIcon size={11} />
                          {t(cfg.labelKey)}
                        </span>
                      </div>
                    </div>

                    {/* Service + Price */}
                    <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Stethoscope size={14} className="text-primary-600 shrink-0" />
                      <span className="truncate">{serviceName}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-extrabold shrink-0">
                        {apt.service.price.toLocaleString()} DZD
                      </span>
                    </div>

                    {/* Date + Address */}
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)] mb-3">
                      <span className={`flex items-center gap-1 ${isToday ? "text-primary-600 dark:text-primary-400 font-semibold" : ""}`}>
                        <Calendar size={12} />
                        {aptDate.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", {
                          weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      {apt.address && (
                        <span className="flex items-center gap-1"><MapPin size={12} />{apt.address}</span>
                      )}
                    </div>

                    {apt.notes && (
                      <p className="text-xs italic text-[var(--text-muted)] mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded-lg">
                        📝 "{apt.notes}"
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, "CONFIRMED")}
                            disabled={updating === apt.id}
                            className="btn-primary text-xs px-4 py-2 gap-1.5"
                          >
                            {updating === apt.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <CheckCircle size={13} />}
                            {t("prov_req_accept")}
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, "CANCELLED")}
                            disabled={updating === apt.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
                          >
                            <XCircle size={13} />
                            {t("prov_req_reject")}
                          </button>
                        </>
                      )}
                      {isConfirmed && (
                        <button
                          onClick={() => updateStatus(apt.id, "COMPLETED")}
                          disabled={updating === apt.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                        >
                          {updating === apt.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                          ) : <CheckCircle size={13} />}
                          {t("prov_sched_btn_complete")}
                        </button>
                      )}
                      {apt.status !== "CANCELLED" && (
                        <button
                          onClick={() => setChatApt(apt)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors border border-primary-200 dark:border-primary-500/20"
                        >
                          <MessageSquare size={13} />
                          {lang === "ar" ? "المحادثة" : lang === "en" ? "Chat" : "Message / Chat"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chatApt && (
        <ChatWindow
          appointmentId={chatApt.id}
          providerName={chatApt.patient.name}
          currentUserId={currentUserId}
          onClose={() => setChatApt(null)}
        />
      )}
    </div>
  );
}
