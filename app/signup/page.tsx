"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import logoImg from "@/public/logo.png";
import featuresImg from "@/public/images/features.png";

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

export default function SignupPage() {
  const router = useRouter();
  const { lang, dir, t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "PATIENT", phone: "", wilaya: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError(
        lang === "ar"
          ? "كلمتا المرور غير متطابقتين."
          : lang === "en"
          ? "Passwords do not match."
          : "Les mots de passe ne correspondent pas."
      );
      return;
    }
    if (form.password.length < 8) {
      setError(
        lang === "ar"
          ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
          : lang === "en"
          ? "Password must contain at least 8 characters."
          : "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone, wilaya: form.wilaya }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Localize error
        if (data.error === "Cet email est déjà utilisé") {
          setError(t("signup_error_email_exists"));
        } else {
          setError(data.error);
        }
        return;
      }
      router.push(form.role === "PROVIDER" ? "/provider" : "/patient");
    } catch {
      setError(
        lang === "ar"
          ? "خطأ في الخادم. أعد المحاولة."
          : lang === "en"
          ? "Server error. Please try again."
          : "Erreur serveur. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const leftPanelFeatures = [
    lang === "ar" ? "الوصول إلى أخصائيين معتمدين" : lang === "en" ? "Access to certified professionals" : "Accès à des professionnels certifiés",
    lang === "ar" ? "متابعة الرعاية في الوقت الفعلي" : lang === "en" ? "Real-time care tracking" : "Suivi de vos soins en temps réel",
    lang === "ar" ? "متوفر في جميع الولايات" : lang === "en" ? "Available in all wilayas" : "Disponible dans toutes les wilayas",
    lang === "ar" ? "آمن وسري بنسبة 100%" : lang === "en" ? "100% secure and confidential" : "100% sécurisé et confidentiel",
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Navbar />
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 min-h-screen">
          <Image
            src={featuresImg}
            alt="SanadiDZ Professional Medical Services"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/40" />
          <div className="relative text-white text-center z-10 max-w-md">
            <div className="space-y-3 max-w-sm mx-auto" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
              {leftPanelFeatures.map((f) => (
                <div key={f} className="flex items-center gap-3 backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl px-4 py-3 shadow-lg" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  <CheckCircle size={18} className="text-[#5CC86A] shrink-0" />
                  <span className="text-sm font-semibold text-white">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg)] overflow-y-auto" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
        <div className="w-full max-w-md py-8">
          <Link href="/" className="flex items-center gap-2 mb-6 lg:hidden" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
            <Image src={logoImg} alt="SanadiDZ" className="w-9 h-9 object-contain" unoptimized />
            <span className="font-bold text-xl">SanadiDZ</span>
          </Link>

          <h2 className="text-3xl font-extrabold mb-2">{t("signup_btn")}</h2>
          <p className="text-[var(--text-muted)] mb-6">{t("signup_desc")}</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { v: "PATIENT", label: lang === "ar" ? "مريض / عائلة" : lang === "en" ? "Patient / Family" : "Patient / Famille" },
              { v: "PROVIDER", label: lang === "ar" ? "أخصائي رعاية" : lang === "en" ? "Care Professional" : "Professionnel" }
            ].map(({ v, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => f("role", v)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.role === v ? "border-primary-600 bg-primary-500/10 text-primary-700 dark:text-primary-400" : "border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/50"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                id="name"
                type="text"
                className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                placeholder={lang === "ar" ? "الاسم الكامل" : lang === "en" ? "Full name" : "Nom complet"}
                value={form.name}
                onChange={(e) => f("name", e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                id="email"
                type="email"
                className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                placeholder={t("email")}
                value={form.email}
                onChange={(e) => f("email", e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                id="phone"
                type="tel"
                className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                placeholder={t("phone") + " (ex: +213 550 123 456)"}
                value={form.phone}
                onChange={(e) => f("phone", e.target.value)}
              />
            </div>

            <div className="relative">
              <MapPin size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <select
                id="wilaya"
                className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"} appearance-none`}
                value={form.wilaya}
                onChange={(e) => f("wilaya", e.target.value)}
              >
                <option value="">{t("signup_placeholder_wilaya")}</option>
                {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="relative">
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                id="password"
                type={show ? "text" : "password"}
                className={`input-field ${lang === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                placeholder={t("password") + " (8 " + (lang === "ar" ? "أحرف كحد أدنى" : lang === "en" ? "chars min." : "caractères min.") + ")"}
                value={form.password}
                onChange={(e) => f("password", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "left-3" : "right-3"}`}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                id="confirm"
                type="password"
                className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                placeholder={lang === "ar" ? "تأكيد كلمة المرور" : lang === "en" ? "Confirm password" : "Confirmer le mot de passe"}
                value={form.confirm}
                onChange={(e) => f("confirm", e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t("signup_btn")}{" "}
                  <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            {t("signup_have_account")}{" "}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              {t("signup_login_here")}
            </Link>
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
