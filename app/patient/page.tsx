import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";
import {
  CalendarDays, FileText, Plus, Clock, MapPin,
  CheckCircle, AlertCircle, XCircle, Stethoscope, ChevronRight,
  ArrowRight, ShieldCheck, HeartPulse, Video, Activity,
} from "lucide-react";

export default async function PatientDashboard() {
  const session = await getSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  const [appointments, records, notifications] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: session!.id },
      include: { service: true, provider: true },
      orderBy: { scheduledAt: "desc" },
      take: 5,
    }),
    prisma.medicalRecord.count({ where: { patientId: session!.id } }),
    prisma.notification.findMany({
      where: { userId: session!.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const pending = appointments.filter((a) => a.status === "PENDING").length;
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    PENDING:   { label: dict.pending,   cls: "badge-pending",   icon: Clock },
    CONFIRMED: { label: dict.confirmed, cls: "badge-confirmed", icon: CheckCircle },
    COMPLETED: { label: dict.completed, cls: "badge-completed", icon: CheckCircle },
    CANCELLED: { label: dict.cancelled, cls: "badge-cancelled", icon: XCircle },
  };

  const stats = [
    { icon: Clock, label: dict.pending, value: pending, color: "from-amber-500 to-orange-500" },
    { icon: CheckCircle, label: dict.confirmed, value: confirmed, color: "from-emerald-500 to-teal-500" },
    { icon: CalendarDays, label: dict.completed, value: completed, color: "from-primary-600 to-primary-500" },
    { icon: FileText, label: dict.dash_sidebar_records, value: records, color: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-start">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-accent-700 text-white p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/10">
              <HeartPulse size={12} className="text-accent-400" />
              {lang === "ar" ? "مساحة المريض" : lang === "en" ? "Patient Space" : "Espace Patient"}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              {dict.pat_dash_welcome} {session!.name} 👋
            </h2>
            <p className="text-primary-200 text-sm mt-1">{dict.pat_dash_subtitle}</p>
          </div>
          <Link
            href="/patient/bookings"
            className="btn-accent shrink-0 text-sm font-bold shadow-lg gap-2"
          >
            <Plus size={16} />
            {dict.pat_book_new_btn}
            <ArrowRight size={14} className="ltr:block rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-extrabold mb-0.5">{value}</div>
            <div className="text-xs text-[var(--text-muted)]">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base">{lang === "ar" ? "المواعيد الأخيرة" : lang === "en" ? "Recent Appointments" : "Rendez-vous récents"}</h3>
            <Link href="/patient/bookings" className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline font-semibold">
              {lang === "ar" ? "عرض الكل" : lang === "en" ? "View all" : "Voir tout"} <ChevronRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
          {appointments.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)]">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{dict.pat_dash_no_upcoming}</p>
              <Link href="/patient/bookings" className="btn-primary mt-4 inline-flex text-sm">{dict.pat_dash_book_first}</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const cfg = statusConfig[apt.status] || statusConfig.PENDING;
                const StatusIcon = cfg.icon;
                const serviceName = lang === "ar" ? apt.service.nameAr : lang === "en" ? apt.service.name : apt.service.nameFr;

                return (
                  <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center shrink-0">
                      <Stethoscope size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{serviceName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(apt.scheduledAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {apt.address && (
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 truncate">
                            <MapPin size={11} />{apt.address.split(",")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${cfg.cls} shrink-0 flex items-center gap-1`}>
                      <StatusIcon size={10} />{cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications + Quick actions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-base mb-4">{lang === "ar" ? "التنبيهات" : lang === "en" ? "Notifications" : "Notifications"}</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{dict.pat_dash_no_notifs}</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0 animate-pulse-soft" />
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-base mb-4">{dict.pat_dash_quick_actions}</h3>
            <div className="space-y-2">
              {[
                { icon: Stethoscope, label: dict.pat_dash_book_service, href: "/patient/bookings" },
                { icon: Video, label: dict.footer_telemedicine, href: "/patient/bookings" },
                { icon: FileText, label: dict.pat_dash_view_records, href: "/patient/records" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-muted)] hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} />
                    <span>{label}</span>
                  </div>
                  <ChevronRight size={14} className="rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
