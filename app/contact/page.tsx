"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  MessageSquare, HeartPulse, AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const { lang, dir } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setError("");
    // Simulate send (no backend endpoint needed for now)
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  const contacts = [
    {
      icon: Phone,
      label: lang === "ar" ? "الهاتف" : lang === "en" ? "Phone" : "Téléphone",
      value: "+213 23 XX XX XX",
      sub: lang === "ar" ? "الأحد — الخميس، 8:00 — 18:00" : lang === "en" ? "Sun — Thu, 8:00 AM — 6:00 PM" : "Dim — Jeu, 8h00 — 18h00",
    },
    {
      icon: Mail,
      label: lang === "ar" ? "البريد الإلكتروني" : lang === "en" ? "Email" : "Email",
      value: "contact@sanadidz.dz",
      sub: lang === "ar" ? "رد خلال 24 ساعة" : lang === "en" ? "Reply within 24 hours" : "Réponse sous 24h",
    },
    {
      icon: MapPin,
      label: lang === "ar" ? "العنوان" : lang === "en" ? "Address" : "Adresse",
      value: lang === "ar" ? "شارع ديدوش مراد، الجزائر العاصمة" : lang === "en" ? "Didouche Mourad St, Algiers" : "Rue Didouche Mourad, Alger",
      sub: lang === "ar" ? "الجزائر" : lang === "en" ? "Algeria" : "Algérie",
    },
    {
      icon: Clock,
      label: lang === "ar" ? "ساعات العمل" : lang === "en" ? "Working Hours" : "Horaires",
      value: lang === "ar" ? "8:00 — 18:00" : "8:00 AM — 6:00 PM",
      sub: lang === "ar" ? "الأحد إلى الخميس" : lang === "en" ? "Sunday to Thursday" : "Dimanche au Jeudi",
    },
  ];

  const subjects = [
    lang === "ar" ? "معلومات عامة" : lang === "en" ? "General information" : "Informations générales",
    lang === "ar" ? "مشكلة تقنية" : lang === "en" ? "Technical issue" : "Problème technique",
    lang === "ar" ? "شراكة" : lang === "en" ? "Partnership" : "Partenariat",
    lang === "ar" ? "بلاغ" : lang === "en" ? "Report" : "Signalement",
    lang === "ar" ? "أخرى" : lang === "en" ? "Other" : "Autre",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]" dir={dir}>
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-accent-700 py-20 px-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={28} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">
            {lang === "ar" ? "تواصلوا معنا" : lang === "en" ? "Contact Us" : "Contactez-nous"}
          </h1>
          <p className="text-primary-200 text-lg max-w-xl mx-auto">
            {lang === "ar"
              ? "فريقنا متاح للإجابة على جميع أسئلتكم وتقديم المساعدة"
              : lang === "en"
              ? "Our team is available to answer all your questions and provide assistance"
              : "Notre équipe est disponible pour répondre à toutes vos questions"}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-2">
                {lang === "ar" ? "معلومات الاتصال" : lang === "en" ? "Contact Information" : "Informations de contact"}
              </h2>
              <p className="text-[var(--text-muted)] text-sm">
                {lang === "ar"
                  ? "نحن هنا لمساعدتكم في رحلتكم الصحية"
                  : lang === "en"
                  ? "We are here to support your health journey"
                  : "Nous sommes là pour vous accompagner dans votre parcours de santé"}
              </p>
            </div>

            <div className="space-y-4">
              {contacts.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="card flex items-start gap-4" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
                    <p className="font-bold text-sm">{value}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency badge */}
            <div className="card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30">
              <div className="flex items-start gap-3" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                <HeartPulse size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                  <p className="font-extrabold text-red-600 dark:text-red-400 text-sm">
                    {lang === "ar" ? "حالة طوارئ؟" : lang === "en" ? "Emergency?" : "Urgence médicale ?"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {lang === "ar"
                      ? "في حالة الطوارئ الطبية، اتصل فوراً بـ 14 (الإسعاف) أو 1021."
                      : lang === "en"
                      ? "For medical emergencies, call 14 (SAMU) or 1021 immediately."
                      : "Pour les urgences médicales, appelez immédiatement le 14 (SAMU) ou le 1021."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3 card">
            <h3 className="font-extrabold text-xl mb-6">
              {lang === "ar" ? "أرسل لنا رسالة" : lang === "en" ? "Send us a message" : "Envoyez-nous un message"}
            </h3>

            {sent ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h4 className="font-extrabold text-lg mb-2">
                  {lang === "ar" ? "تم إرسال رسالتك!" : lang === "en" ? "Message sent!" : "Message envoyé !"}
                </h4>
                <p className="text-[var(--text-muted)] text-sm max-w-xs mx-auto">
                  {lang === "ar"
                    ? "سنتواصل معك في أقرب وقت ممكن، خلال 24 ساعة."
                    : lang === "en"
                    ? "We'll get back to you as soon as possible, within 24 hours."
                    : "Nous vous répondrons dans les meilleurs délais, sous 24 heures."}
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="btn-secondary mt-6 text-sm"
                >
                  {lang === "ar" ? "إرسال رسالة أخرى" : lang === "en" ? "Send another message" : "Envoyer un autre message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600 text-sm">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                      {lang === "ar" ? "الاسم الكامل" : lang === "en" ? "Full name" : "Nom complet"} *
                    </label>
                    <input
                      className="input-field"
                      placeholder={lang === "ar" ? "أحمد بن علي" : lang === "en" ? "Ahmed Ben Ali" : "Ahmed Ben Ali"}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      style={{ textAlign: lang === "ar" ? "right" : "left" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                      {lang === "ar" ? "البريد الإلكتروني" : lang === "en" ? "Email" : "Email"} *
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="exemple@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      style={{ textAlign: lang === "ar" ? "right" : "left" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                    {lang === "ar" ? "الموضوع" : lang === "en" ? "Subject" : "Sujet"}
                  </label>
                  <select
                    className="input-field appearance-none"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={{ textAlign: lang === "ar" ? "right" : "left" }}
                  >
                    <option value="">{lang === "ar" ? "اختر موضوعاً" : lang === "en" ? "Select a subject" : "Choisissez un sujet"}</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                    {lang === "ar" ? "رسالتك" : lang === "en" ? "Your message" : "Votre message"} *
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={5}
                    placeholder={
                      lang === "ar"
                        ? "اكتب رسالتك هنا..."
                        : lang === "en"
                        ? "Write your message here..."
                        : "Écrivez votre message ici..."
                    }
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    style={{ textAlign: lang === "ar" ? "right" : "left" }}
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">
                    {form.message.length}/1000
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      {lang === "ar" ? "إرسال الرسالة" : lang === "en" ? "Send message" : "Envoyer le message"}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
