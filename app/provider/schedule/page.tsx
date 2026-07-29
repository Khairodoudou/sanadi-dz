import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";
import { CalendarDays, Clock, User, MapPin, CheckCircle, Stethoscope, Activity } from "lucide-react";

export default async function ProviderSchedulePage() {
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

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { providerId: session!.id, status: { in: ["CONFIRMED", "PENDING"] } },
        { providerId: null, status: "PENDING" },
      ],
    },
    include: { service: true, patient: { select: { name: true, phone: true, wilaya: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  const today = new Date();
  const todayStr = today.toDateString();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Group appointments by date
  const grouped: Record<string, typeof appointments> = {};
  for (const apt of appointments) {
    const d = new Date(apt.scheduledAt);
    const key = d.toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(apt);
  }

  const sortedDays = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const todayApts = grouped[todayStr] || [];
  const totalUpcoming = appointments.filter((a) => new Date(a.scheduledAt) >= startOfToday).length;

  return (
    <div className="space-y-6 animate-fade-in" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
        <div>
          <h2 className="text-2xl font-extrabold">{dict.prov_sched_title}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            {totalUpcoming > 0
              ? `${totalUpcoming} ${lang === "ar" ? "موعد قادم" : lang === "en" ? "upcoming appointment(s)" : "rendez-vous à venir"}`
              : lang === "ar" ? "لا توجد مواعيد مجدولة" : "Aucun rendez-vous planifié"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] font-medium">
          <CalendarDays size={16} className="text-primary-600 dark:text-primary-400" />
          {today.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </div>
      </div>

      {/* Today's summary banner */}
      <div className={`rounded-2xl p-5 border ${
        todayApts.length > 0
          ? "bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-700/30"
          : "bg-[var(--bg-card)] border-[var(--border)]"
      }`}>
        <div className="flex items-center gap-3 mb-3" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            todayApts.length > 0 ? "bg-primary-600 text-white" : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
          }`}>
            <Activity size={18} />
          </div>
          <div>
            <h3 className="font-extrabold">
              {lang === "ar" ? "اليوم" : lang === "en" ? "Today" : "Aujourd'hui"} —{" "}
              {today.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", {
                weekday: "long", day: "2-digit", month: "long",
              })}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {todayApts.length} {lang === "ar" ? "موعد اليوم" : lang === "en" ? "appointment(s) today" : "rendez-vous aujourd'hui"}
            </p>
          </div>
        </div>

        {todayApts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">
            {dict.prov_dash_no_today || (lang === "ar" ? "لا مواعيد اليوم" : "Aucun rendez-vous aujourd'hui")}
          </p>
        ) : (
          <div className="space-y-2.5">
            {todayApts.map((a) => {
              const cfg = statusConfig[a.status] || statusConfig.PENDING;
              const serviceName = lang === "ar" ? a.service.nameAr : lang === "en" ? a.service.name : a.service.nameFr;
              const aptTime = new Date(a.scheduledAt);
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                  {/* Time block */}
                  <div className="text-center shrink-0 w-14">
                    <div className="text-xl font-extrabold text-primary-600 dark:text-primary-400 leading-none">
                      {aptTime.toLocaleTimeString(lang === "fr" ? "fr-DZ" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {a.service.duration > 0 ? `${a.service.duration} min` : "—"}
                    </div>
                  </div>
                  <div className="w-px h-10 bg-[var(--border)]" />
                  <div className="flex-1 min-w-0" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                    <p className="font-bold text-sm truncate">{a.patient.name}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Stethoscope size={11} />{serviceName}
                      {a.patient.wilaya && <><span>·</span><MapPin size={11} />{a.patient.wilaya}</>}
                    </p>
                  </div>
                  <span className={`badge ${cfg.cls} shrink-0 text-[10px]`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All grouped days */}
      {sortedDays.map((day) => {
        const dayApts = grouped[day];
        const dayDate = new Date(day);
        const isToday = day === todayStr;
        const isFuture = dayDate > today;
        const isPast = dayDate < startOfToday;

        if (isToday && todayApts.length > 0) return null; // Already shown in top banner

        return (
          <div key={day} className={`card ${isPast ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-3 mb-4" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isFuture || isToday ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
              }`}>
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-base">
                  {dayDate.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "en" ? "en-US" : "fr-DZ", {
                    weekday: "long", day: "2-digit", month: "long", year: "numeric",
                  })}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {dayApts.length} {lang === "ar" ? "موعد" : lang === "en" ? "appointment(s)" : "rendez-vous"}
                  {isPast && ` · ${lang === "ar" ? "مضى" : lang === "en" ? "Passed" : "Passé"}`}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {dayApts.map((a) => {
                const cfg = statusConfig[a.status] || statusConfig.PENDING;
                const serviceName = lang === "ar" ? a.service.nameAr : lang === "en" ? a.service.name : a.service.nameFr;
                const aptTime = new Date(a.scheduledAt);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border)] transition-colors" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                    <div className="text-center shrink-0 w-12">
                      <div className="text-base font-extrabold leading-none">
                        {aptTime.toLocaleTimeString(lang === "fr" ? "fr-DZ" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {a.service.duration > 0 ? `${a.service.duration}m` : ""}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-[var(--border)]" />
                    <div className="flex-1 min-w-0" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                      <p className="font-semibold text-sm truncate">{a.patient.name}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5" style={{ flexDirection: lang === "ar" ? "row-reverse" : "row" }}>
                        <span className="flex items-center gap-1"><Stethoscope size={10} />{serviceName}</span>
                        {a.patient.wilaya && (
                          <span className="flex items-center gap-1"><MapPin size={10} />{a.patient.wilaya}</span>
                        )}
                      </div>
                    </div>
                    <span className={`badge ${cfg.cls} shrink-0 text-[10px]`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {appointments.length === 0 && (
        <div className="card text-center py-16">
          <CalendarDays size={44} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-sm">
            {lang === "ar" ? "لا توجد مواعيد مجدولة حالياً" : lang === "en" ? "No scheduled appointments" : "Aucun rendez-vous planifié"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {lang === "ar" ? "عند قبول طلب، سيظهر الموعد هنا." : "Après avoir accepté une demande, le rendez-vous apparaîtra ici."}
          </p>
        </div>
      )}
    </div>
  );
}
