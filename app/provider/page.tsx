import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";
import {
  ClipboardList, CheckCircle, Clock, XCircle,
  CalendarDays, User, MapPin, ChevronRight, ArrowRight,
  TrendingUp, Banknote, Star, AlertTriangle, Activity,
} from "lucide-react";

export default async function ProviderDashboard() {
  const session = await getSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: dict.pending,   cls: "badge-pending"   },
    CONFIRMED: { label: dict.confirmed, cls: "badge-confirmed" },
    COMPLETED: { label: dict.completed, cls: "badge-completed" },
    CANCELLED: { label: dict.cancelled, cls: "badge-cancelled" },
  };

  const providerWhere = {
    OR: [
      { providerId: session!.id },
      { providerId: null, status: "PENDING" },
    ],
  };

  const [recentAppointments, pending, confirmed, completed, cancelled, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: providerWhere,
      include: { service: true, patient: { select: { name: true, phone: true, wilaya: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 8,
    }),
    prisma.appointment.count({
      where: {
        OR: [
          { providerId: session!.id, status: "PENDING" },
          { providerId: null, status: "PENDING" },
        ],
      },
    }),
    prisma.appointment.count({ where: { providerId: session!.id, status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { providerId: session!.id, status: "COMPLETED" } }),
    prisma.appointment.count({ where: { providerId: session!.id, status: "CANCELLED" } }),
    prisma.review.findMany({
      where: { providerId: session!.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { patient: { select: { name: true } } },
    }),
  ]);

  // Calculate total revenue from completed appointments
  const completedAppointments = await prisma.appointment.findMany({
    where: { providerId: session!.id, status: "COMPLETED" },
    include: { service: { select: { price: true } } },
  });
  const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.service.price, 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  // Today's appointments
  const today = new Date();
  const todayApts = recentAppointments.filter(a => {
    const d = new Date(a.scheduledAt);
    return d.toDateString() === today.toDateString() && (a.status === "CONFIRMED" || a.status === "PENDING");
  });

  const stats = [
    { icon: Clock, label: lang === "ar" ? "طلبات معلقة" : lang === "en" ? "Pending Requests" : "Demandes en attente", value: pending, color: "from-amber-500 to-orange-500", bgLight: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", alert: pending > 0 },
    { icon: CheckCircle, label: lang === "ar" ? "مؤكدة" : lang === "en" ? "Confirmed" : "Confirmés", value: confirmed, color: "from-emerald-500 to-teal-500", bgLight: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", alert: false },
    { icon: CalendarDays, label: lang === "ar" ? "مكتملة" : lang === "en" ? "Completed" : "Terminés", value: completed, color: "from-primary-600 to-primary-500", bgLight: "bg-blue-50 dark:bg-primary-500/10", border: "border-blue-200 dark:border-primary-500/20", alert: false },
    { icon: Banknote, label: lang === "ar" ? "إجمالي الإيرادات" : lang === "en" ? "Total Revenue" : "Revenus totaux", value: `${totalRevenue.toLocaleString()} DZD`, color: "from-violet-500 to-purple-600", bgLight: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/20", alert: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-start">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-accent-700 text-white p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">
              {today.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {dict.prov_dash_welcome} {session!.name.split(" ")[0]} 👋
            </h2>
            <p className="text-primary-200 text-sm mt-1">{dict.prov_dash_subtitle}</p>
            {todayApts.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl text-sm font-semibold">
                <Activity size={14} className="text-accent-400" />
                {todayApts.length} {lang === "ar" ? "موعد اليوم" : lang === "en" ? "appointment(s) today" : "rendez-vous aujourd'hui"}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {pending > 0 && (
              <Link href="/provider/requests" className="relative flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg">
                <AlertTriangle size={15} />
                {pending} {lang === "ar" ? "طلب جديد" : lang === "en" ? "new request(s)" : "nouvelle(s) demande(s)"}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </Link>
            )}
            <Link href="/provider/requests" className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-sm transition-all border border-white/20">
              <ClipboardList size={15} />
              {dict.dash_sidebar_requests}
              <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bgLight, border, alert }) => (
          <div key={label} className={`relative card ${bgLight} border ${border} hover:shadow-lg transition-all`}>
            {alert && (
              <span className="absolute top-3 ltr:right-3 rtl:left-3 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="text-xl font-extrabold">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{label}</div>
          </div>
        ))}
      </div>

      {/* Two column layout: Recent appointments + Stats widgets */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Appointments — 2/3 */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg">{dict.prov_dash_recent_req}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {recentAppointments.length} {lang === "ar" ? "طلب إجمالي" : lang === "en" ? "total requests" : "demandes au total"}
              </p>
            </div>
            <Link href="/provider/requests" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline font-semibold">
              {lang === "ar" ? "عرض الكل" : lang === "en" ? "View all" : "Voir tout"}
              <ChevronRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{dict.prov_req_no_req}</p>
              <p className="text-xs mt-1 opacity-70">
                {lang === "ar" ? "ستظهر طلبات المرضى هنا عند وصولها." : "Les demandes des patients apparaîtront ici."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAppointments.map((apt) => {
                const cfg = statusConfig[apt.status] || statusConfig.PENDING;
                const serviceName = lang === "ar" ? apt.service.nameAr : lang === "en" ? apt.service.name : apt.service.nameFr;
                const aptDate = new Date(apt.scheduledAt);
                const isToday = aptDate.toDateString() === today.toDateString();
                return (
                  <div key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isToday ? "bg-primary-500/5 border border-primary-500/15" : "bg-[var(--bg-muted)] hover:bg-[var(--border)]"}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center shrink-0 font-bold text-accent-600 dark:text-accent-400 text-sm">
                      {apt.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.patient.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[var(--text-muted)] truncate">{serviceName}</span>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} />
                          {isToday ? (
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {lang === "ar" ? "اليوم" : "Auj."} {aptDate.toLocaleTimeString(lang === "fr" ? "fr-DZ" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          ) : (
                            aptDate.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", { day: "2-digit", month: "short" })
                          )}
                        </span>
                        {apt.patient.wilaya && (
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin size={10} />{apt.patient.wilaya}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${cfg.cls} shrink-0 text-[10px]`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: performance + reviews */}
        <div className="space-y-4">
          {/* Performance widget */}
          <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-100 dark:border-primary-800/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <TrendingUp size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-sm">{lang === "ar" ? "الأداء العام" : lang === "en" ? "Performance" : "Performance"}</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">{lang === "ar" ? "معدل الإتمام" : "Taux de complétion"}</span>
                  <span className="font-bold text-emerald-600">
                    {pending + confirmed + completed > 0 ? Math.round((completed / (pending + confirmed + completed + cancelled)) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${pending + confirmed + completed > 0 ? Math.round((completed / (pending + confirmed + completed + cancelled)) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">{lang === "ar" ? "معدل القبول" : "Taux d'acceptation"}</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {pending + confirmed + confirmed + completed > 0 ? Math.round(((confirmed + completed) / (pending + confirmed + completed + cancelled)) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
                    style={{ width: `${pending + confirmed + completed > 0 ? Math.round(((confirmed + completed) / (pending + confirmed + completed + cancelled)) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
            {avgRating && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {lang === "ar" ? "تقييم المرضى" : "Note patients"}
                </span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="font-extrabold text-sm text-amber-700 dark:text-amber-400">{avgRating}</span>
                  <span className="text-xs text-[var(--text-muted)]">/ 5</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <div className="card">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Star size={15} className="text-amber-500" />
                {lang === "ar" ? "آخر التقييمات" : lang === "en" ? "Recent Reviews" : "Derniers avis"}
              </h4>
              <div className="space-y-2.5">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-2.5 rounded-xl bg-[var(--bg-muted)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold truncate">{r.patient.name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} className={s <= r.rating ? "text-amber-500 fill-amber-500" : "text-[var(--border)]"} />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-2">"{r.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="card">
            <h4 className="font-bold text-sm mb-3">{lang === "ar" ? "وصول سريع" : "Accès rapide"}</h4>
            <div className="space-y-2">
              {[
                { href: "/provider/requests", icon: ClipboardList, label: lang === "ar" ? "طلبات التدخل" : dict.dash_sidebar_requests, badge: pending > 0 ? pending : null },
                { href: "/provider/schedule", icon: CalendarDays, label: lang === "ar" ? "برنامجي" : dict.dash_sidebar_schedule, badge: null },
                { href: "/provider/profile", icon: User, label: lang === "ar" ? "ملفي الشخصي" : dict.dash_sidebar_profile, badge: null },
              ].map(({ href, icon: Icon, label, badge }, idx) => (
                <Link key={idx} href={href} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border)] transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge !== null && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{badge}</span>
                    )}
                    <ChevronRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors rtl:rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
