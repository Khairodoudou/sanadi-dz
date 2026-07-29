"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Stethoscope, Heart, Video, ClipboardList, Salad, Car, Baby, Brain,
  Activity, UtensilsCrossed, Clock, ArrowRight, Search, Filter,
  CheckCircle, Star, Sparkles, X, Shield, Calendar, MapPin
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ServiceItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  category: string;
  description: string;
  descFr: string;
  icon: string;
  price: number;
  duration: number;
  available: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Stethoscope, Heart, Video, ClipboardList, Salad, Car, Baby, Brain, Activity, UtensilsCrossed,
};

const categoryColors: Record<string, { bg: string; text: string; badgeBg: string; border: string }> = {
  HOME_CARE:     { bg: "from-blue-600 to-indigo-600", text: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  TELEMEDICINE:  { bg: "from-violet-600 to-purple-600", text: "text-violet-600 dark:text-violet-400", badgeBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
  COORDINATION:  { bg: "from-amber-500 to-orange-500", text: "text-amber-600 dark:text-amber-400", badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  WELLBEING:     { bg: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  DAILY_SUPPORT: { bg: "from-rose-500 to-pink-600", text: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
};

export function ServicesClient({ services }: { services: ServiceItem[] }) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"POPULAR" | "PRICE_ASC" | "PRICE_DESC">("POPULAR");
  const [activeModalService, setActiveModalService] = useState<ServiceItem | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map((s) => s.category)));
    return ["ALL", ...cats];
  }, [services]);

  const getCategoryLabel = (cat: string) => {
    if (cat === "ALL") return lang === "ar" ? "جميع الخدمات" : lang === "en" ? "All Services" : "Tous les services";
    if (cat === "HOME_CARE") return lang === "ar" ? "رعاية منزلية" : lang === "en" ? "Home Care" : "Soins à Domicile";
    if (cat === "TELEMEDICINE") return lang === "ar" ? "تعديل عن بعد" : lang === "en" ? "Telemedicine" : "Télémédecine";
    if (cat === "COORDINATION") return lang === "ar" ? "تنسيق الرعاية" : lang === "en" ? "Care Coordination" : "Coordination des Soins";
    if (cat === "WELLBEING") return lang === "ar" ? "صحة وتغذية" : lang === "en" ? "Wellbeing" : "Bien-être & Santé";
    if (cat === "DAILY_SUPPORT") return lang === "ar" ? "دعم يومي" : lang === "en" ? "Daily Support" : "Support Quotidien";
    return cat;
  };

  const filteredServices = useMemo(() => {
    let result = services.filter((s) => {
      const matchCat = selectedCategory === "ALL" || s.category === selectedCategory;
      const name = (lang === "ar" ? s.nameAr : lang === "en" ? s.name : s.nameFr).toLowerCase();
      const desc = (lang === "ar" ? s.nameAr : lang === "en" ? s.description : s.descFr).toLowerCase();
      const query = search.toLowerCase().trim();
      const matchSearch = !query || name.includes(query) || desc.includes(query);
      return matchCat && matchSearch;
    });

    if (sortBy === "PRICE_ASC") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "PRICE_DESC") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [services, selectedCategory, search, sortBy, lang]);

  return (
    <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
      {/* Search & Filter Header Section */}
      <section className="sticky top-16 z-30 py-4 glass border-b border-[var(--border)] mb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث عن خدمة..." : lang === "en" ? "Search a service..." : "Rechercher un soin, infirmier..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full py-2.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-sm focus:outline-none focus:border-primary-500 transition-colors ${
                  lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] ${lang === "ar" ? "left-3" : "right-3"}`}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = cat === "ALL" ? services.length : services.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/20 scale-105"
                        : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                    }`}
                  >
                    {getCategoryLabel(cat)}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isActive ? "bg-white/20 text-white" : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs self-end md:self-auto">
              <Filter size={14} className="text-[var(--text-muted)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2 font-medium focus:outline-none text-xs"
              >
                <option value="POPULAR">{lang === "ar" ? "الأكثر شعبية" : lang === "en" ? "Most Popular" : "Plus populaires"}</option>
                <option value="PRICE_ASC">{lang === "ar" ? "السعر: من الأقل للأعلى" : lang === "en" ? "Price: Low to High" : "Prix : Croissant"}</option>
                <option value="PRICE_DESC">{lang === "ar" ? "السعر: من الأعلى للأقل" : lang === "en" ? "Price: High to Low" : "Prix : Décroissant"}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)]">
            <Stethoscope size={48} className="text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">
              {lang === "ar" ? "لم يتم العثور على خدمات" : lang === "en" ? "No services found" : "Aucun service trouvé"}
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">
              {lang === "ar" ? "جرب البحث بكلمات أخرى أو اختر فئة مختلفة." : "Essayez de rechercher avec un autre mot-clé ou réinitialisez les filtres."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
              }}
              className="btn-secondary text-xs px-4 py-2"
            >
              {lang === "ar" ? "إعادة ضبط الفلاتر" : "Réinitialiser les filtres"}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((s) => {
              const Icon = iconMap[s.icon] ?? Stethoscope;
              const serviceName = lang === "ar" ? s.nameAr : lang === "en" ? s.name : s.nameFr;
              const serviceDesc = lang === "ar" ? s.nameAr : lang === "en" ? s.description : s.descFr;
              const catTheme = categoryColors[s.category] || categoryColors.HOME_CARE;

              return (
                <div
                  key={s.id}
                  className="group card relative flex flex-col justify-between hover:border-primary-500/40 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div>
                    {/* Header bar with icon & category pill */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${catTheme.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${catTheme.badgeBg} ${catTheme.border}`}>
                        {getCategoryLabel(s.category)}
                      </span>
                    </div>

                    {/* Service Title */}
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {serviceName}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 line-clamp-3">
                      {serviceDesc}
                    </p>

                    {/* Feature bullet tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)]">
                        <CheckCircle size={12} className="text-emerald-500" />
                        {lang === "ar" ? "معتمد" : "Certifié"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)]">
                        <Shield size={12} className="text-primary-500" />
                        {lang === "ar" ? "69 ولاية" : "69 Wilayas"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Star size={11} className="fill-amber-500" />
                        4.9/5
                      </span>
                    </div>
                  </div>

                  {/* Footer / Price & CTA */}
                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black gradient-text">
                        {s.price.toLocaleString()} <span className="text-xs font-bold text-[var(--text-muted)]">{lang === "ar" ? "د.ج" : "DZD"}</span>
                      </div>
                      {s.duration > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                          <Clock size={12} /> {s.duration} {lang === "ar" ? "دقيقة" : "min"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModalService(s)}
                        className="btn-secondary text-xs px-3 py-2 rounded-xl"
                      >
                        {lang === "ar" ? "التفاصيل" : "Détails"}
                      </button>
                      <Link href="/signup" className="btn-primary text-xs px-4 py-2 rounded-xl shadow-md shadow-primary-600/20">
                        {t("services_book_btn")}
                        <ArrowRight size={14} className={lang === "ar" ? "rotate-180" : ""} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How it works banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-accent-900 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 text-accent-400 font-extrabold text-lg">
                1
              </div>
              <h4 className="font-bold text-lg mb-2">{lang === "ar" ? "اختر الخدمة" : "Sélectionnez le soin"}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === "ar" ? "اختر الخدمة الطبية المناسبة لاحتياجاتك." : "Parcourez notre catalogue et choisissez l'intervention médicale adaptée."}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 text-accent-400 font-extrabold text-lg">
                2
              </div>
              <h4 className="font-bold text-lg mb-2">{lang === "ar" ? "حدد الموعد" : "Fixez la date"}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === "ar" ? "اختر التاريخ والوقت المناسبين لك في أي ولاية." : "Choisissez l'horaire et le lieu d'intervention dans n'importe quelle wilaya."}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 text-accent-400 font-extrabold text-lg">
                3
              </div>
              <h4 className="font-bold text-lg mb-2">{lang === "ar" ? "استقبل الممرض/الطبيب" : "Recevez le soignant"}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === "ar" ? "يتنقل المهني المعتمد إلى منزلك لتقديم الرعاية." : "Un professionnel de santé qualifié se déplace directement chez vous."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Details Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveModalService(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-lg">
                {(() => {
                  const Icon = iconMap[activeModalService.icon] ?? Stethoscope;
                  return <Icon size={28} />;
                })()}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">
                  {lang === "ar" ? activeModalService.nameAr : lang === "en" ? activeModalService.name : activeModalService.nameFr}
                </h3>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {getCategoryLabel(activeModalService.category)}
                </span>
              </div>
            </div>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {lang === "ar" ? activeModalService.nameAr : lang === "en" ? activeModalService.description : activeModalService.descFr}
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bg-muted)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{lang === "ar" ? "التعريفة" : "Tarif fixe"} :</span>
                <span className="font-bold text-base gradient-text">{activeModalService.price.toLocaleString()} DZD</span>
              </div>
              {activeModalService.duration > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">{lang === "ar" ? "المدة المقدرة" : "Durée estimée"} :</span>
                  <span className="font-bold">{activeModalService.duration} min</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">{lang === "ar" ? "التغطية" : "Couverture"} :</span>
                <span className="font-bold text-emerald-500">69 Wilayas d&apos;Algérie</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModalService(null)}
                className="btn-secondary flex-1 justify-center py-3 text-sm"
              >
                {lang === "ar" ? "إغلاق" : "Fermer"}
              </button>
              <Link
                href="/signup"
                className="btn-primary flex-1 justify-center py-3 text-sm"
                onClick={() => setActiveModalService(null)}
              >
                {t("services_book_btn")}
                <ArrowRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
