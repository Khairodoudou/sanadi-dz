"use client";
import { useEffect, useState } from "react";
import {
  User as UserIcon, Mail, Phone, MapPin, Save, CheckCircle,
  Stethoscope, Star, Calendar, Award, AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia",
];

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  wilaya: string;
  role: string;
  approved: boolean;
  createdAt: string;
};

export default function ProviderProfilePage() {
  const { t, lang } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", wilaya: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setForm({ name: d.user.name || "", phone: d.user.phone || "", wilaya: d.user.wilaya || "" });
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
      } else {
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-20 bg-[var(--bg-muted)]" />
        ))}
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString(
    lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold">{t("prof_title")}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">
          {lang === "ar" ? "إدارة معلوماتك المهنية" : lang === "en" ? "Manage your professional information" : "Gérez vos informations professionnelles"}
        </p>
      </div>

      {/* Profile card */}
      <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-100 dark:border-primary-800/30">
        <div className="flex items-center gap-5" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-xl font-extrabold text-3xl shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <p className="font-extrabold text-xl">{user.name}</p>
            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <Award size={11} />
                {lang === "ar" ? "مقدم خدمة معتمد" : lang === "en" ? "Certified Provider" : "Prestataire certifié"}
              </span>
              {user.approved ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                  <CheckCircle size={11} />
                  {lang === "ar" ? "موافق عليه" : lang === "en" ? "Approved" : "Approuvé"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  <AlertTriangle size={11} />
                  {lang === "ar" ? "في انتظار الموافقة" : "En attente d'approbation"}
                </span>
              )}
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Calendar size={11} />
                {lang === "ar" ? "عضو منذ" : lang === "en" ? "Member since" : "Membre depuis"} {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 className="font-bold mb-5 flex items-center gap-2" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          <UserIcon size={18} className="text-primary-600" />
          {t("prof_personal")}
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">{t("name")}</label>
            <div className="relative">
              <UserIcon size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                className={`input-field ${lang === "ar" ? "pr-10" : "pl-10"}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ textAlign: lang === "ar" ? "right" : "left" }}
              />
            </div>
          </div>

          {/* Email — readonly */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
              {t("email")}
              <span className="ml-2 text-[10px] font-normal opacity-60">({lang === "ar" ? "لا يمكن تعديله" : "non modifiable"})</span>
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                className={`input-field ${lang === "ar" ? "pr-10" : "pl-10"} opacity-50 cursor-not-allowed`}
                value={user.email}
                disabled
                style={{ textAlign: lang === "ar" ? "right" : "left" }}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">{t("phone")}</label>
            <div className="relative">
              <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                className={`input-field ${lang === "ar" ? "pr-10" : "pl-10"}`}
                placeholder="+213 6XX XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ textAlign: lang === "ar" ? "right" : "left" }}
              />
            </div>
          </div>

          {/* Wilaya dropdown */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">{t("wilaya")}</label>
            <div className="relative">
              <MapPin size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <select
                className={`input-field ${lang === "ar" ? "pr-10" : "pl-10"} appearance-none`}
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                style={{ textAlign: lang === "ar" ? "right" : "left" }}
              >
                <option value="">{lang === "ar" ? "اختر ولايتك" : "Sélectionnez votre Wilaya"}</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-fade-in">
              <CheckCircle size={16} />
              {lang === "ar" ? "تم الحفظ بنجاح" : lang === "en" ? "Saved successfully" : "Enregistré avec succès"}
            </div>
          )}
          <div className={saved ? "" : "ml-auto rtl:ml-0 rtl:mr-auto"}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 justify-center"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving
                ? lang === "ar" ? "جارٍ الحفظ..." : "Enregistrement..."
                : t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
