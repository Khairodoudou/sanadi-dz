"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, Clock, MapPin, CheckCircle, AlertCircle, XCircle,
  Plus, Stethoscope, ChevronDown, CreditCard, MessageSquare, Star,
  Download, User, Banknote, ShieldCheck, Check,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ReviewModal } from "@/components/reviews/ReviewModal";

type ServiceItem = {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  category: string;
  price: number;
  duration: number;
  icon?: string;
  wilaya?: string;
  providerId?: string;
  provider?: {
    id: string;
    name: string;
    avatar?: string;
    wilaya?: string;
    phone?: string;
    email?: string;
  };
};

type Appointment = {
  id: string;
  status: string;
  scheduledAt: string;
  address: string;
  notes: string;
  service: { name: string; nameFr: string; nameAr: string; category: string; price: number };
  provider: { name: string; phone?: string } | null;
  payment?: { id: string; status: string } | null;
  review?: { rating: number } | null;
};

const statusConfig: Record<string, { labelKey: string; cls: string }> = {
  PENDING:   { labelKey: "pending",   cls: "badge-pending" },
  CONFIRMED: { labelKey: "confirmed", cls: "badge-confirmed" },
  COMPLETED: { labelKey: "completed", cls: "badge-completed" },
  CANCELLED: { labelKey: "cancelled", cls: "badge-cancelled" },
};

const FILTERS = ["Tous", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function PatientBookingsPage() {
  const { t, lang, dir } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [showForm, setShowForm] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [form, setForm] = useState({
    serviceId: "",
    providerId: "",
    scheduledAt: "",
    address: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [paymentApt, setPaymentApt] = useState<Appointment | null>(null);
  const [chatApt, setChatApt] = useState<Appointment | null>(null);
  const [reviewApt, setReviewApt] = useState<Appointment | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => {
        setAppointments(d.appointments || []);
        if (d.currentUserId) setCurrentUserId(d.currentUserId);
        setLoading(false);
      });

    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
  }, []);

  const filtered = filter === "Tous" ? appointments : appointments.filter((a) => a.status === filter);

  // Selected Service & Provider Info
  const selectedService = services.find((s) => s.id === selectedServiceId);

  function handleSelectService(svcId: string) {
    setSelectedServiceId(svcId);
    const svc = services.find((s) => s.id === svcId);
    setForm((p) => ({
      ...p,
      serviceId: svcId,
      providerId: svc?.providerId || "",
    }));
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceId) return;
    setSubmitting(true);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const d = await res.json();
      setAppointments((prev) => [d.appointment, ...prev]);
      setShowForm(false);
      setSelectedServiceId("");
      setForm({ serviceId: "", providerId: "", scheduledAt: "", address: "", notes: "" });
    }
    setSubmitting(false);
  };

  const L = {
    title: t("pat_book_title"),
    newBtn: t("pat_book_new_btn"),
    modalTitle: t("pat_book_modal_title"),
    selectService: lang === "ar" ? "اختر الخدمة والمزود *" : "Sélectionner la prestation et le praticien *",
    selectPlaceholder: lang === "ar" ? "-- اختر خدمة ومزود --" : "-- Choisir une prestation et un praticien --",
    providerDetails: lang === "ar" ? "تفاصيل المزود والتسعيرة" : "Détails du praticien et tarif",
    date: t("date"),
    time: t("time"),
    address: t("address"),
    notes: t("notes"),
    optional: lang === "ar" ? "(اختياري)" : "(optionnel)",
    cancel: t("cancel"),
    confirmBtn: t("pat_book_modal_btn"),
    byProvider: lang === "ar" ? "بواسطة" : "Par",
    wilaya: lang === "ar" ? "الولاية" : "Wilaya",
    price: lang === "ar" ? "السعر" : "Tarif",
    duration: lang === "ar" ? "المدة" : "Durée",
    verifiedProvider: lang === "ar" ? "مقدم خدمة معتمد" : "Praticien vérifié & certifié",
  };

  return (
    <div className="space-y-6 animate-fade-in text-start" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{L.title}</h2>
          <p className="text-[var(--text-muted)] text-sm">
            {appointments.length} {lang === "ar" ? "حجز إجمالي" : "rendez-vous au total"}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary shrink-0 justify-center">
          <Plus size={16} /> {L.newBtn}
        </button>
      </div>

      {/* Booking form with Provider Selection & Pricing */}
      {showForm && (
        <div className="card animate-fade-in-up border-primary-600/30 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <CalendarDays size={20} /> {L.modalTitle}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg">
              <XCircle size={20} />
            </button>
          </div>

          <form onSubmit={handleBook} className="space-y-5">
            {/* Step 1: Select Service / Provider */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-muted)]">
                {L.selectService}
              </label>
              <div className="relative">
                <select
                  className="input w-full py-3 pe-10 appearance-none font-medium"
                  value={selectedServiceId}
                  onChange={(e) => handleSelectService(e.target.value)}
                  required
                >
                  <option value="">{L.selectPlaceholder}</option>
                  {services.map((s) => {
                    const name = lang === "ar" ? s.nameAr || s.name : s.nameFr || s.name;
                    const providerInfo = s.provider ? ` (${s.provider.name} — ${s.wilaya || s.provider.wilaya || "Algérie"})` : "";
                    return (
                      <option key={s.id} value={s.id}>
                        {s.icon} {name} {providerInfo} — {s.price.toLocaleString()} DA
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={18} className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] end-3" />
              </div>
            </div>

            {/* Provider Preview Card */}
            {selectedService && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 via-emerald-500/5 to-violet-500/10 border border-primary-500/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-emerald-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                      {selectedService.provider ? selectedService.provider.name[0] : "S"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base">
                          {selectedService.provider ? selectedService.provider.name : "SanadiDZ Provider"}
                        </h4>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={12} /> {L.verifiedProvider}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {selectedService.category} {selectedService.wilaya && `• 📍 ${selectedService.wilaya}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedService.price.toLocaleString()} DA
                    </div>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 justify-end">
                      <Clock size={12} /> {selectedService.duration} min
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date, Time & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--text-muted)]">
                  {L.date} & {L.time} *
                </label>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--text-muted)]">
                  {L.address} *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder={lang === "ar" ? "مثال: 12 شارع ديدوش مراد، الجزائر العاصمة" : "Ex: 12 Rue Didouche Mourad, Alger"}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-[var(--text-muted)]">
                {L.notes} {L.optional}
              </label>
              <textarea
                className="input w-full"
                rows={2}
                placeholder={t("pat_book_modal_notes_placeholder")}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-2 border-t border-[var(--border)]">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                {L.cancel}
              </button>
              <button type="submit" disabled={submitting || !form.serviceId} className="btn-primary">
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  L.confirmBtn
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? "bg-primary-600 text-white shadow-md"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {f === "Tous" ? t("pat_book_tabs_all") : t(statusConfig[f]?.labelKey)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-[var(--bg-muted)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <CalendarDays size={40} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
          <p className="text-[var(--text-muted)] text-sm">
            {lang === "ar" ? "لم يتم العثور على مواعيد." : "Aucun rendez-vous trouvé."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const cfg = statusConfig[apt.status] || statusConfig.PENDING;
            const serviceName = lang === "ar" ? apt.service.nameAr || apt.service.name : apt.service.nameFr || apt.service.name;
            return (
              <div
                key={apt.id}
                className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary-600/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center shrink-0">
                  <Stethoscope size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-bold text-sm">{serviceName}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {apt.provider ? `${t("pat_book_card_with")} ${apt.provider.name}` : t("pat_book_card_provider_pending")}
                      </p>
                    </div>
                    <span className={`badge ${cfg.cls} shrink-0`}>{t(cfg.labelKey)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={12} />
                      {new Date(apt.scheduledAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {apt.address && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <MapPin size={12} />
                        {apt.address}
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {apt.service.price.toLocaleString()} DA
                    </span>

                    <div className="flex items-center gap-2 ms-auto">
                      {apt.provider && (
                        <button
                          onClick={() => setChatApt(apt)}
                          className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                        >
                          <MessageSquare size={13} /> {lang === "ar" ? "محادثة" : "Chat"}
                        </button>
                      )}

                      {apt.status === "COMPLETED" && !apt.review && (
                        <button
                          onClick={() => setReviewApt(apt)}
                          className="btn-primary py-1 px-3 text-xs flex items-center gap-1 bg-amber-500 hover:bg-amber-600 border-none"
                        >
                          <Star size={13} /> {lang === "ar" ? "تقييم" : "Avis"}
                        </button>
                      )}

                      {apt.status !== "CANCELLED" && (
                        <button
                          onClick={() => setPaymentApt(apt)}
                          className={`py-1 px-3 text-xs flex items-center gap-1 font-medium rounded-xl border transition-colors ${
                            apt.payment?.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "btn-secondary"
                          }`}
                        >
                          <CreditCard size={13} />
                          {apt.payment?.status === "PAID"
                            ? lang === "ar" ? "مدفوع" : "Payé"
                            : lang === "ar" ? "دفع" : "Payer"}
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

      {/* Modals for Payment, Chat, and Review */}
      {paymentApt && (
        <PaymentModal
          appointmentId={paymentApt.id}
          amount={paymentApt.service.price}
          onClose={() => setPaymentApt(null)}
          onSuccess={() => {
            setAppointments((prev) =>
              prev.map((a) => (a.id === paymentApt.id ? { ...a, payment: { id: "p1", status: "PAID" } } : a))
            );
            setPaymentApt(null);
          }}
        />
      )}

      {chatApt && chatApt.provider && (
        <ChatWindow
          appointmentId={chatApt.id}
          currentUserId={currentUserId}
          providerName={chatApt.provider.name}
          onClose={() => setChatApt(null)}
        />
      )}

      {reviewApt && reviewApt.provider && (
        <ReviewModal
          appointmentId={reviewApt.id}
          providerName={reviewApt.provider.name}
          onClose={() => setReviewApt(null)}
          onSuccess={() => {
            setAppointments((prev) =>
              prev.map((a) => (a.id === reviewApt.id ? { ...a, review: { rating: 5 } } : a))
            );
            setReviewApt(null);
          }}
        />
      )}
    </div>
  );
}
