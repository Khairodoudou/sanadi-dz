import Link from "next/link";
import Image from "next/image";
import heroImg from "@/public/images/hero.png";
import featuresImg from "@/public/images/features.png";
import telemedicineImg from "@/public/images/telemedicine.png";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";
import {
  Stethoscope, Heart, Video, ClipboardList, Salad, Car,
  ChevronRight, Shield, Clock, Star, Users, CheckCircle,
  ArrowRight, HeartPulse, Baby, Activity, Brain,
} from "lucide-react";

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  const services = [
    { icon: Stethoscope, title: lang === "ar" ? "رعاية تمريضية" : lang === "en" ? "Nursing Care" : "Soins Infirmiers", desc: dict.desc_nursing_care, color: "from-primary-600 to-primary-500" },
    { icon: Heart, title: lang === "ar" ? "رعاية المسنين" : lang === "en" ? "Elderly Care" : "Aide aux Seniors", desc: dict.desc_elderly_care, color: "from-rose-500 to-pink-500" },
    { icon: Video, title: lang === "ar" ? "استشارة بالفيديو" : lang === "en" ? "Video Consultation" : "Téléconsultation", desc: dict.desc_video_consultation, color: "from-violet-500 to-purple-500" },
    { icon: ClipboardList, title: lang === "ar" ? "تنسيق الرعاية" : lang === "en" ? "Care Coordination" : "Coordination des Soins", desc: dict.desc_care_coordination, color: "from-amber-500 to-orange-500" },
    { icon: Baby, title: lang === "ar" ? "رعاية ما بعد الولادة" : lang === "en" ? "Postnatal Care" : "Soins Post-Nataux", desc: dict.desc_postnatal_care, color: "from-pink-500 to-rose-400" },
    { icon: Brain, title: lang === "ar" ? "الدعم النفسي" : lang === "en" ? "Psychological Support" : "Soutien Psychologique", desc: dict.desc_psychology_support, color: "from-indigo-500 to-violet-500" },
    { icon: Salad, title: lang === "ar" ? "التوجيه الغذائي" : lang === "en" ? "Nutrition Coaching" : "Coaching Nutritionnel", desc: dict.desc_nutrition_coaching, color: "from-accent-500 to-accent-600" },
    { icon: Car, title: lang === "ar" ? "النقل الطبي" : lang === "en" ? "Medical Transport" : "Transport Médical", desc: dict.desc_medical_transport, color: "from-slate-500 to-gray-500" },
  ];

  const stats = [
    { icon: Users, value: "5,000+", label: dict.home_stat_patients },
    { icon: Star, value: "4.9/5", label: dict.home_stat_rating },
    { icon: CheckCircle, value: "98%", label: dict.home_stat_sat },
    { icon: Clock, value: "24/7", label: dict.home_stat_avail },
  ];

  const features = [
    { icon: Shield, title: dict.home_why_feat_1_title, desc: dict.home_why_feat_1_desc },
    { icon: Clock, title: dict.home_why_feat_2_title, desc: dict.home_why_feat_2_desc },
    { icon: Activity, title: dict.home_why_feat_3_title, desc: dict.home_why_feat_3_desc },
    { icon: HeartPulse, title: dict.home_why_feat_4_title, desc: dict.home_why_feat_4_desc },
  ];

  const steps = [
    { n: "01", title: dict.home_step_1_title, desc: dict.home_step_1_desc },
    { n: "02", title: dict.home_step_2_title, desc: dict.home_step_2_desc },
    { n: "03", title: dict.home_step_3_title, desc: dict.home_step_3_desc },
    { n: "04", title: dict.home_step_4_title, desc: dict.home_step_4_desc },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              {dict.home_hero_title_1}{" "}
              <span className="gradient-text">{dict.home_hero_title_accent}</span>{" "}
              {dict.home_hero_title_2}
            </h1>

            <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8 max-w-lg">
              {dict.home_hero_desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/signup" className="btn-primary text-base px-6 py-3 justify-center">
                {dict.home_hero_cta_book}
                <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
              </Link>
              <Link href="/services" className="btn-secondary text-base px-6 py-3 justify-center">
                {dict.home_hero_cta_services}
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {[dict.home_hero_tag_1, dict.home_hero_tag_2, dict.home_hero_tag_3].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-full max-w-lg">
              {/* Decorative background glow & ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary-600/30 to-accent-500/30 blur-2xl -z-10 animate-pulse-soft" />
              
              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-primary-500/20 shadow-2xl bg-[var(--bg-card)]">
                <Image
                  src={heroImg}
                  alt="Accomp Healthcare Professional Home Visit"
                  width={600}
                  height={500}
                  className="w-full h-[440px] object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 glass rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Service à Domicile 24/7</p>
                    </div>
                  </div>
                  <div className="text-xs bg-primary-600/80 px-3 py-1.5 rounded-xl font-bold">69 Wilayas</div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-5 -right-5 glass rounded-2xl p-3 flex items-center gap-3 shadow-xl border border-primary-500/30 animate-float">
                <div className="w-9 h-9 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">{dict.home_orbit_care}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Praticiens Agrées</p>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 glass rounded-2xl p-3 flex items-center gap-3 shadow-xl border border-primary-500/30 animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="w-9 h-9 rounded-xl bg-accent-500/20 flex items-center justify-center text-accent-600 dark:text-accent-400">
                  <Video size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">{dict.home_orbit_tele}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Consultation vidéo HD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center group-hover:bg-primary-600/20 transition-colors shrink-0">
                  <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold gradient-text">{value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold mb-4">
            {dict.home_services_title} <span className="gradient-text">{dict.home_services_title_accent}</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            {dict.home_services_desc}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card group cursor-pointer flex flex-col justify-between" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                {dict.home_services_more} <ChevronRight size={14} className={lang === "ar" ? "rotate-180" : ""} />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services" className="btn-primary px-8 py-3 text-base">
            {dict.home_services_all}
            <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[var(--bg-card)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4">{dict.home_how_title} <span className="gradient-text">{dict.home_how_accent}</span></h2>
            <p className="text-[var(--text-muted)]">{dict.home_how_desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-extrabold text-lg group-hover:scale-110 transition-transform">
                  {n}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <h2 className="text-4xl font-extrabold mb-6">
              {dict.home_why_title} <span className="gradient-text">{dict.home_why_accent}</span>?
            </h2>
            <p className="text-[var(--text-muted)] mb-10 leading-relaxed">
              {dict.home_why_desc}
            </p>
            <div className="space-y-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  <div className="w-11 h-11 rounded-xl bg-primary-600/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{title}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden shadow-xl group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={featuresImg}
                  alt="Accomp Healthcare Features"
                  width={500}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: dict.footer_home_care, pct: 92 },
                  { label: dict.footer_telemedicine, pct: 85 },
                  { label: dict.footer_coordination, pct: 78 },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                      <span className="font-medium">{label}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 glass rounded-2xl border border-primary-500/20" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                  <p className="text-sm font-medium mb-1">{dict.home_why_sat_title}</p>
                  <div className="text-4xl font-extrabold gradient-text">98%</div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{dict.home_why_sat_desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telemedicine Banner Feature */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 text-white overflow-hidden shadow-2xl relative grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12">
          <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-4 backdrop-blur-md">
              <Video size={14} className="text-accent-400" />
              Téléconsultation Médicale HD
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              Consultez un médecin qualifié <span className="text-accent-400">depuis chez vous</span>
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              Bénéficiez de conseils médicaux instantanés, de renouvellements d&apos;ordonnances et de diagnostics à distance en toute confidentialité.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm transition-all shadow-lg">
                Prendre rendez-vous en ligne
                <ArrowRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={telemedicineImg}
              alt="Telemedicine Consultation"
              width={600}
              height={400}
              className="w-full h-[300px] md:h-[350px] object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 glass px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              En Direct
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <HeartPulse size={48} className="text-white/80 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-extrabold text-white mb-4">
            {dict.home_cta_title}
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            {dict.home_cta_desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-2xl font-bold text-base hover:bg-primary-50 transition-colors shadow-lg justify-center">
              {dict.home_cta_btn}
              <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-2xl font-bold text-base hover:bg-white/20 transition-colors justify-center">
              {dict.home_cta_services}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

