import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { HeartPulse, Target, Users, Shield, ArrowRight, Award, Camera } from "lucide-react";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";
import heroImg from "@/public/images/hero.png";
import featuresImg from "@/public/images/features.png";
import telemedicineImg from "@/public/images/telemedicine.png";

export default async function AboutPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  const values = [
    { icon: Shield, title: dict.about_value_1_title, desc: dict.about_value_1_desc },
    { icon: Target, title: dict.about_value_2_title, desc: dict.about_value_2_desc },
    { icon: Users, title: dict.about_value_3_title, desc: dict.about_value_3_desc },
    { icon: Award, title: dict.about_value_4_title, desc: dict.about_value_4_desc },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
            <HeartPulse size={16} /> {dict.about_hero_badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            {dict.about_hero_title} <span className="gradient-text">{dict.about_hero_accent}</span> {dict.about_hero_title_2}
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            {dict.about_hero_desc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[var(--bg-card)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            {dict.about_values_title} <span className="gradient-text">{dict.about_values_accent}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "69", label: dict.about_stat_wilayas },
              { value: "200+", label: dict.about_stat_pros },
              { value: "5,000+", label: dict.home_stat_patients },
              { value: "24/7", label: dict.home_stat_avail },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold gradient-text mb-1">{value}</div>
                <div className="text-sm text-[var(--text-muted)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Showcase */}
      <section className="py-20 bg-[var(--bg-card)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-600 dark:text-primary-400 text-xs font-bold">
              <Camera size={14} />
              {lang === "ar" ? "معرض الصور" : lang === "en" ? "Photo Gallery" : "Galerie Photos"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {lang === "ar" ? "خدماتنا الميدانية بالصور" : lang === "en" ? "Our Field Services in Pictures" : "Nos Services en Images"}
            </h2>
            <p className="text-[var(--text-muted)] text-base">
              {lang === "ar" 
                ? "نظرة على جودة الخدمات الطبية والاستشارات التي نقدمها لمرضانا في مختلف الولايات" 
                : lang === "en" 
                ? "A glimpse into the quality medical care and consultations provided across Algeria" 
                : "Un aperçu de la qualité des soins et des consultations dispensés à nos patients à travers l'Algérie"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gallery Item 1 */}
            <div className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg)] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={heroImg}
                  alt="Soins infirmiers à domicile"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-primary-600/90 text-white text-xs font-bold backdrop-blur-md">
                  {lang === "ar" ? "رعاية منزلية" : lang === "en" ? "Home Care" : "Soins à Domicile"}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                    {lang === "ar" ? "الرعاية التمريضية المنزلية" : lang === "en" ? "Home Nursing Care" : "Soins Infirmiers à Domicile"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {lang === "ar" 
                      ? "تقديم الفحوصات والتمريض المباشر للمرضى وكبار السن في منزلهم بكل راحة وأمان." 
                      : lang === "en" 
                      ? "Providing direct nursing checks and care for patients and seniors in the comfort of home." 
                      : "Prise en charge infirmière et soins attentifs aux patients et personnes âgées à domicile."}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg)] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={featuresImg}
                  alt="Suivi médical numérique"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-violet-600/90 text-white text-xs font-bold backdrop-blur-md">
                  {lang === "ar" ? "متابعة رقمية" : lang === "en" ? "Digital Tracking" : "Suivi Numérique"}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-violet-600 transition-colors">
                    {lang === "ar" ? "إدارة الملفات الطبية" : lang === "en" ? "Medical Records Management" : "Gestion des Dossiers Médicaux"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {lang === "ar" 
                      ? "تنسيق متكامل بين الأطباء والممرضين لضمان متابعة دقيقة لكل حالة صحية." 
                      : lang === "en" 
                      ? "Seamless coordination between doctors and nurses for accurate health case tracking." 
                      : "Coordination fluide entre médecins et infirmiers pour un suivi médical optimal."}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="group rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg)] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={telemedicineImg}
                  alt="Téléconsultation vidéo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-4 start-4 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold backdrop-blur-md">
                  {lang === "ar" ? "استشارة عن بُعد" : lang === "en" ? "Teleconsultation" : "Téléconsultation"}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                    {lang === "ar" ? "الاستشارات الطبية بالفيديو" : lang === "en" ? "Online Video Consultations" : "Consultations Vidéo en Ligne"}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {lang === "ar" 
                      ? "استشارات مباشرة مع أطباء أخصائيين من دون الحاجة للتنقل والمواظبة." 
                      : lang === "en" 
                      ? "Direct video consultations with specialist doctors without needing to travel." 
                      : "Consultations vidéo en direct avec des médecins spécialistes sans déplacement."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">{dict.about_cta_title}</h2>
          <p className="text-[var(--text-muted)] mb-8">
            {dict.about_cta_desc}
          </p>
          <Link href="/signup" className="btn-primary px-8 py-3 text-base justify-center">
            {dict.about_cta_btn} <ArrowRight size={18} className={lang === "ar" ? "rotate-180" : ""} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

