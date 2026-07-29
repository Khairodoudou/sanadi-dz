"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import logoImg from "@/public/logo.png";
import heroImg from "@/public/images/hero.png";

export default function LoginPage() {
  const router = useRouter();
  const { lang, dir, t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        // Localize invalid credentials error
        if (data.error === "Identifiants invalides") {
          setError(t("login_invalid"));
        } else {
          setError(data.error);
        }
        return;
      }
      const role = data.user.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "PROVIDER") router.push("/provider");
      else router.push("/patient");
    } catch {
      setError(
        lang === "ar"
          ? "خطأ في الاتصال. أعد المحاولة."
          : lang === "en"
          ? "Connection error. Please try again."
          : "Erreur de connexion. Réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  const leftPanelFeatures = [
    lang === "ar" ? "رعاية تمريضية منزلية" : lang === "en" ? "Nursing care at home" : "Soins infirmiers à domicile",
    lang === "ar" ? "استشارات طبية عن بعد" : lang === "en" ? "Medical teleconsultation" : "Téléconsultation médicale",
    lang === "ar" ? "متابعة شخصية على مدار الساعة" : lang === "en" ? "24/7 Personalized follow-up" : "Suivi personnalisé 24/7",
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Navbar />
      <div className="flex-1 flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 min-h-screen">
          <Image
            src={heroImg}
            alt="SanadiDZ Home Healthcare"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/40" />
          <div className="relative text-white text-center z-10 max-w-md">
            <div className="space-y-3 max-w-sm mx-auto" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
              {leftPanelFeatures.map((f) => (
                <div key={f} className="flex items-center gap-3 backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl px-4 py-3 shadow-lg" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5CC86A] shrink-0 shadow-sm shadow-[#5CC86A]" />
                  <span className="text-sm font-semibold text-white">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg)]" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <Image src={logoImg} alt="SanadiDZ" className="w-9 h-9 object-contain" unoptimized />
              <span className="font-bold text-xl">SanadiDZ</span>
            </Link>

            <h2 className="text-3xl font-extrabold mb-2">
              {t("login_title")} <span className="gradient-text">SanadiDZ</span>
            </h2>
            <p className="text-[var(--text-muted)] mb-8">{t("login_desc")}</p>

            {/* Demo credentials */}
            <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm">
              <p className="font-semibold text-primary-700 dark:text-primary-400 mb-2">
                {lang === "ar" ? "حسابات تجريبية :" : lang === "en" ? "Demo accounts:" : "Comptes de démonstration :"}
              </p>
              <div className="space-y-1 text-[var(--text-muted)]">
                <p>
                  <span className="font-medium">{t("role_admin")}:</span> admin@sanadidz.dz / admin123
                </p>
                <p>
                  <span className="font-medium">{t("role_patient")}:</span> patient@sanadidz.dz / patient123
                </p>
                <p>
                  <span className="font-medium">{t("role_provider")}:</span> provider@sanadidz.dz / provider123
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">{t("email")}</label>
                <div className="relative">
                  <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type="email"
                    id="email"
                    className={`input-field ${lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                    placeholder={t("login_placeholder_email")}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("password")}</label>
                <div className="relative">
                  <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type={show ? "text" : "password"}
                    id="password"
                    className={`input-field ${lang === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] ${lang === "ar" ? "left-3" : "right-3"}`}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t("login_btn")}{" "}
                    <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              {t("login_no_account")}{" "}
              <Link href="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                {t("login_register_here")}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
