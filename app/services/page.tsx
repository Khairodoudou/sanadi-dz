"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Search, MapPin, Filter, Banknote, Clock, Stethoscope, Send, X,
  CheckCircle2, Loader2, User, AlertTriangle, Calendar, LogIn, UserPlus, Lock,
} from "lucide-react";
import Link from "next/link";

interface Provider { id: string; name: string; avatar?: string; wilaya?: string; }
interface Service {
  id: string; name: string; nameFr: string; nameAr: string;
  category: string; description: string; descFr: string;
  icon: string; price: number; duration: number; available: boolean;
  wilaya?: string; providerId?: string; provider?: Provider;
}

const CATEGORIES = [
  "Tous", "Soins infirmiers", "Médecine générale", "Kinésithérapie",
  "Psychologie", "Nutrition", "Pédiatrie", "Cardiologie",
];

const WILAYAS = [
  "Toutes", "Alger", "Oran", "Constantine", "Annaba", "Blida", "Sétif", "Batna",
  "Béjaïa", "Tlemcen", "Tizi Ouzou", "Biskra", "Ouargla", "Mostaganem",
];

export default function PublicServicesPage() {
  const { lang, dir } = useLanguage();
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]         = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  // Filters
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("Tous");
  const [wilaya, setWilaya]     = useState("Toutes");
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // Modal Request
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requestForm, setRequestForm] = useState({
    description: "", address: "", scheduledAt: "", urgency: "NORMAL",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const L = {
    title:    lang === "ar" ? "خدماتنا الطبية والصحية" : lang === "en" ? "Medical & Health Services" : "Services Médicaux & Santé",
    subtitle: lang === "ar" ? "تصفح خدمات المهنيين وحجز رعاية متخصصة في منزلكم" : lang === "en" ? "Browse professional services and book specialized care at home" : "Découvrez les soins disponibles et demandez une intervention à domicile",
    searchPh: lang === "ar" ? "ابحث عن خدمة، تخصص، أو طبيب..." : lang === "en" ? "Search for a service, specialty, or practitioner..." : "Rechercher un service, spécialité, praticien...",
    categ:    lang === "ar" ? "الفئة" : lang === "en" ? "Category" : "Catégorie",
    wil:      lang === "ar" ? "الولاية" : "Wilaya",
    maxP:     lang === "ar" ? "السعر الأقصى" : lang === "en" ? "Max price" : "Prix max",
    reqBtn:   lang === "ar" ? "طلب هذه الخدمة" : lang === "en" ? "Request this service" : "Demander ce service",
    dur:      lang === "ar" ? "دقيقة" : "min",
    by:       lang === "ar" ? "بواسطة" : lang === "en" ? "By" : "Par",
    noSrv:    lang === "ar" ? "لا توجد خدمات تطابق البحث" : lang === "en" ? "No services match your search" : "Aucun service ne correspond à vos critères",
    guest: {
      title:   lang === "ar" ? "أنت غير مسجّل الدخول" : lang === "en" ? "You are not logged in" : "Vous n'êtes pas connecté",
      desc:    lang === "ar" ? "لحجز خدمة أو إرسال طلب، يجب أن تكون مسجلاً في حسابك. سجّل الدخول أو أنشئ حساباً مجانياً الآن." : lang === "en" ? "To book a service or send a request, you need to be signed in. Log in or create a free account now." : "Pour réserver un service ou envoyer une demande, vous devez être connecté. Connectez-vous ou créez un compte gratuitement.",
      login:   lang === "ar" ? "تسجيل الدخول" : lang === "en" ? "Log in" : "Se connecter",
      signup:  lang === "ar" ? "إنشاء حساب" : lang === "en" ? "Create an account" : "Créer un compte",
    },
    modal: {
      title:  lang === "ar" ? "طلب خدمة مخصصة" : lang === "en" ? "Request this service" : "Demander ce service",
      desc:   lang === "ar" ? "وصف الحاجة والتعليمات" : lang === "en" ? "Detailed description of your need" : "Description détaillée du besoin",
      addr:   lang === "ar" ? "العنوان الكامل" : lang === "en" ? "Full address" : "Adresse complète d'intervention",
      date:   lang === "ar" ? "التاريخ والوقت المرغوب" : lang === "en" ? "Preferred date and time" : "Date et heure souhaitées",
      urg:    lang === "ar" ? "درجة الاستعجال" : lang === "en" ? "Urgency level" : "Niveau d'urgence",
      normal: lang === "ar" ? "عادي" : lang === "en" ? "Normal" : "Normal",
      urgent: lang === "ar" ? "عاجل" : lang === "en" ? "Urgent" : "Urgent",
      send:   lang === "ar" ? "إرسال الطلب للمزودين" : lang === "en" ? "Send request to providers" : "Envoyer la demande",
      succ:   lang === "ar" ? "تم إرسال طلبك بنجاح للمزودين المؤهلين!" : lang === "en" ? "Your request was successfully sent to qualified providers!" : "Votre demande a été envoyée avec succès aux prestataires qualifiés !",
    },
  };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "Tous") params.set("category", category);
      if (wilaya !== "Toutes") params.set("wilaya", wilaya);
      if (maxPrice < 10000) params.set("maxPrice", maxPrice.toString());

      const r = await fetch(`/api/services?${params.toString()}`);
      const d = await r.json();
      setServices(d.services || []);
    } finally {
      setLoading(false);
    }
  }, [search, category, wilaya, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(fetchServices, 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          ...requestForm,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          setSelectedService(null);
          setRequestForm({ description: "", address: "", scheduledAt: "", urgency: "NORMAL" });
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between" dir={dir}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  // ── Guest banner (not logged in) ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between" dir={dir}>
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page title (visible even for guests) */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{L.title}</h1>
              <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base sm:text-lg">{L.subtitle}</p>
            </div>

            {/* Guest message card */}
            <div className="max-w-xl mx-auto">
              <div className="card border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-accent-500/5 p-8 text-center space-y-6 animate-fade-in">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center">
                  <Lock size={28} className="text-primary-500" />
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{L.guest.title}</h2>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">{L.guest.desc}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/login"
                    className="btn-primary w-full sm:w-auto justify-center gap-2 text-base py-3 px-6"
                  >
                    <LogIn size={18} />
                    {L.guest.login}
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-secondary w-full sm:w-auto justify-center gap-2 text-base py-3 px-6"
                  >
                    <UserPlus size={18} />
                    {L.guest.signup}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-between" dir={dir}>
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base sm:text-lg">{L.subtitle}</p>
        </div>

        {/* Filter Bar */}
        <div className="card p-6 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              className="input w-full ps-11 text-base py-3"
              placeholder={L.searchPh}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{L.categ}</label>
              <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">{L.wil}</label>
              <select className="input w-full" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                {L.maxP}: <span className="text-primary-600 font-bold">{maxPrice.toLocaleString()} DA</span>
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                className="w-full accent-primary-600 mt-2"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-500" size={36} />
          </div>
        ) : services.length === 0 ? (
          <div className="card text-center py-20 space-y-3">
            <Stethoscope size={54} className="mx-auto text-[var(--text-muted)] opacity-30" />
            <p className="text-lg font-semibold">{L.noSrv}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="card hover:border-primary-500/40 transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{s.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary-600 transition-colors">
                          {lang === "ar" ? s.nameAr || s.name : s.nameFr || s.name}
                        </h3>
                        <span className="inline-block text-xs font-medium text-primary-600 bg-primary-500/10 px-2.5 py-0.5 rounded-full mt-1">
                          {s.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
                    {lang === "ar" ? s.description : s.descFr || s.description}
                  </p>

                  {s.provider && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-primary-600">
                        {s.provider.name[0]}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {L.by} <strong className="text-[var(--text-main)]">{s.provider.name}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {s.price.toLocaleString()} DA
                    </div>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={12} /> {s.duration} {L.dur}
                      {s.wilaya && <span>• {s.wilaya}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedService(s)}
                    className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Send size={14} /> {L.reqBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedService(null)}>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden border border-[var(--border)] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg-card)] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedService.icon}</span>
                <h3 className="font-bold text-lg">
                  {lang === "ar" ? selectedService.nameAr : selectedService.nameFr}
                </h3>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-[var(--bg-hover)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div className="p-8 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{L.modal.succ}</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-semibold mb-1">{L.modal.desc} *</label>
                    <textarea
                      required
                      rows={3}
                      className="input w-full text-sm"
                      placeholder="Ex: Patient de 70 ans nécessitant un pansement quotidien suite à une intervention..."
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">{L.modal.addr} *</label>
                    <input
                      required
                      type="text"
                      className="input w-full text-sm"
                      placeholder="Ex: Cité 1000 Logements, Bâtiment B4, Alger"
                      value={requestForm.address}
                      onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">{L.modal.date} *</label>
                      <input
                        required
                        type="datetime-local"
                        className="input w-full text-sm"
                        value={requestForm.scheduledAt}
                        onChange={(e) => setRequestForm({ ...requestForm, scheduledAt: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">{L.modal.urg}</label>
                      <select
                        className="input w-full text-sm"
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      >
                        <option value="NORMAL">{L.modal.normal}</option>
                        <option value="URGENT">{L.modal.urgent}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-card)] shrink-0">
                  <button type="button" onClick={() => setSelectedService(null)} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {L.modal.send}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
