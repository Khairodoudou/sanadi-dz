"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Users, UserCheck, UserX, Clock, Stethoscope, CalendarDays,
  ClipboardList, FileText, CreditCard, Star, TrendingUp, Activity,
  AlertTriangle, BarChart3, RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const LineChart = dynamic(() => import("@/components/charts/Charts").then(m => ({ default: m.LineChart })), { ssr: false });
const BarChart  = dynamic(() => import("@/components/charts/Charts").then(m => ({ default: m.BarChart })),  { ssr: false });
const Doughnut  = dynamic(() => import("@/components/charts/Charts").then(m => ({ default: m.DoughnutChart })), { ssr: false });

interface Stats {
  users: { total: number; patients: number; providers: number; approvedProviders: number; pendingProviders: number; suspendedProviders: number };
  services: { total: number; active: number; featured: number };
  requests: { total: number; pending: number };
  appointments: { total: number; pending: number; completed: number; cancelled: number };
  records: number;
  payments: { total: number; revenue: number; commission: number };
  reviews: number;
  charts: {
    registrations: { date: string; count: number }[];
    bookings: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
  };
  recentUsers: { id: string; name: string; email: string; role: string; wilaya?: string; approved: boolean; suspended: boolean; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const { lang, dir } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "لوحة تحكم المشرف" : isEn ? "Admin Dashboard" : "Tableau de Bord Admin",
    subtitle: isAr ? "إشراف كامل على منصة صنادي دي زد" : isEn ? "Full platform supervision for SanadiDZ" : "Supervision complète de la plateforme SanadiDZ",
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",
    statUsers: isAr ? "إجمالي المستخدمين" : isEn ? "Total Users" : "Total Utilisateurs",
    statApprovedProv: isAr ? "مقدمو رعاية معتمدون" : isEn ? "Verified Providers" : "Providers Vérifiés",
    statPendingProv: isAr ? "مقدمو رعاية قيد الانتظار" : isEn ? "Pending Providers" : "Providers en Attente",
    statSuspendedProv: isAr ? "مقدمو رعاية معلقون" : isEn ? "Suspended Providers" : "Providers Suspendus",
    statServices: isAr ? "الخدمات" : isEn ? "Services" : "Services",
    statRequests: isAr ? "طلبات الخدمات" : isEn ? "Service Requests" : "Demandes de Service",
    statAppointments: isAr ? "المواعيد" : isEn ? "Appointments" : "Rendez-vous",
    statRecords: isAr ? "الملفات الطبية" : isEn ? "Medical Records" : "Dossiers Médicaux",
    statRevenue: isAr ? "إجمالي الإيرادات" : isEn ? "Total Revenue" : "Revenus Total",
    statReviews: isAr ? "تقييمات المستخدمين" : isEn ? "User Reviews" : "Avis Utilisateurs",
    
    subPatients: isAr ? "مرضى" : isEn ? "patients" : "patients",
    subTotal: isAr ? "إجمالي" : isEn ? "total" : "total",
    subToApprove: isAr ? "للاعتماد" : isEn ? "To approve" : "À approuver",
    subBlocked: isAr ? "حساب معلق" : isEn ? "Account blocked" : "Compte bloqué",
    subActive: isAr ? "نشطة" : isEn ? "active" : "actifs",
    subPending: isAr ? "قيد الانتظار" : isEn ? "pending" : "en attente",
    subCompleted: isAr ? "مكتملة" : isEn ? "completed" : "complétés",
    subConfidential: isAr ? "سرّي" : isEn ? "Confidential" : "Confidentiel",
    subCommission: isAr ? "العمولة" : isEn ? "Commission" : "Commission",
    subAllReviews: isAr ? "كل التقييمات" : isEn ? "All reviews" : "Tous les avis",

    chartRegs: isAr ? "التسجيلات (7 أيام)" : isEn ? "Registrations (7d)" : "Inscriptions (7j)",
    chartBookings: isAr ? "المواعيد (7 أيام)" : isEn ? "Bookings (7d)" : "Rendez-vous (7j)",
    chartSplit: isAr ? "توزيع المواعيد" : isEn ? "Appointment Breakdown" : "Répartition RDV",
    chartRevenue: isAr ? "الإيرادات (آخر 7 أيام)" : isEn ? "Revenue (Last 7 days)" : "Revenus (7 derniers jours)",

    donutPending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "En attente",
    donutCompleted: isAr ? "مكتملة" : isEn ? "Completed" : "Complétés",
    donutCancelled: isAr ? "ملغاة" : isEn ? "Cancelled" : "Annulés",
    donutOthers: isAr ? "أخرى" : isEn ? "Others" : "Autres",
    noData: isAr ? "لا توجد بيانات" : isEn ? "No data" : "Aucune donnée",

    alertPending: isAr ? "مقدم(و) رعاية في انتظار الاعتماد" : isEn ? "provider(s) pending approval" : "provider(s) en attente d'approbation",
    alertDesc: isAr ? "تحقق من وثائقهم واعتمد أو ارفض حساباتهم." : isEn ? "Verify their documents and approve or reject their account." : "Vérifiez leurs documents et approuvez ou refusez leur compte.",
    alertBtn: isAr ? "عرض الطلبات" : isEn ? "View requests" : "Voir les demandes",

    recentUsers: isAr ? "آخر التسجيلات" : isEn ? "Recent Registrations" : "Dernières inscriptions",
    thName: isAr ? "الاسم" : isEn ? "Name" : "Nom",
    thEmail: isAr ? "البريد الإلكتروني" : isEn ? "Email" : "Email",
    thRole: isAr ? "الصفة" : isEn ? "Role" : "Rôle",
    thWilaya: isAr ? "الولاية" : isEn ? "Wilaya" : "Wilaya",
    thStatus: isAr ? "الحالة" : isEn ? "Status" : "Statut",
    thJoined: isAr ? "تاريخ التسجيل" : isEn ? "Joined on" : "Inscrit le",

    badgeActive: isAr ? "نشط" : isEn ? "Active" : "Actif",
    badgePending: isAr ? "قيد الانتظار" : isEn ? "Pending" : "En attente",
    badgeSuspended: isAr ? "معلق" : isEn ? "Suspended" : "Suspendu",

    linkProviders: isAr ? "إدارة مقدمي الرعاية" : isEn ? "Manage Providers" : "Gérer Providers",
    linkPatients: isAr ? "إدارة المرضى" : isEn ? "Manage Patients" : "Gérer Patients",
    linkPayments: isAr ? "المدفوعات" : isEn ? "Payments" : "Paiements",
    linkAudit: isAr ? "سجل المراجعة" : isEn ? "Audit Log" : "Journal d'Audit",
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) { setStats(await res.json()); setLastUpdate(new Date()); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = stats ? [
    { icon: Users,       label: L.statUsers,        value: stats.users.total,                 color: "from-indigo-500 to-indigo-700",   bg: "bg-indigo-500/10", sub: `${stats.users.patients} ${L.subPatients}` },
    { icon: UserCheck,   label: L.statApprovedProv, value: stats.users.approvedProviders,      color: "from-emerald-500 to-emerald-700", bg: "bg-emerald-500/10", sub: `${stats.users.providers} ${L.subTotal}` },
    { icon: Clock,       label: L.statPendingProv,  value: stats.users.pendingProviders,       color: "from-amber-500 to-amber-700",     bg: "bg-amber-500/10",  sub: L.subToApprove },
    { icon: UserX,       label: L.statSuspendedProv,value: stats.users.suspendedProviders,     color: "from-red-500 to-red-700",         bg: "bg-red-500/10",    sub: L.subBlocked },
    { icon: Stethoscope, label: L.statServices,     value: stats.services.total,               color: "from-purple-500 to-purple-700",   bg: "bg-purple-500/10", sub: `${stats.services.active} ${L.subActive}` },
    { icon: ClipboardList,label: L.statRequests,    value: stats.requests.total,               color: "from-sky-500 to-sky-700",         bg: "bg-sky-500/10",    sub: `${stats.requests.pending} ${L.subPending}` },
    { icon: CalendarDays,label: L.statAppointments, value: stats.appointments.total,           color: "from-violet-500 to-violet-700",   bg: "bg-violet-500/10", sub: `${stats.appointments.completed} ${L.subCompleted}` },
    { icon: FileText,    label: L.statRecords,      value: stats.records,                      color: "from-teal-500 to-teal-700",       bg: "bg-teal-500/10",   sub: L.subConfidential },
    { icon: CreditCard,  label: L.statRevenue,      value: `${stats.payments.revenue.toLocaleString()} DA`, color: "from-green-500 to-green-700", bg: "bg-green-500/10", sub: `${L.subCommission}: ${stats.payments.commission.toLocaleString()} DA` },
    { icon: Star,        label: L.statReviews,      value: stats.reviews,                      color: "from-yellow-500 to-yellow-700",   bg: "bg-yellow-500/10", sub: L.subAllReviews },
  ] : [];

  const appointmentDonut = stats ? [
    { name: L.donutPending,   value: stats.appointments.pending },
    { name: L.donutCompleted, value: stats.appointments.completed },
    { name: L.donutCancelled, value: stats.appointments.cancelled },
    { name: L.donutOthers,    value: Math.max(0, stats.appointments.total - stats.appointments.pending - stats.appointments.completed - stats.appointments.cancelled) },
  ].filter(d => d.value > 0) : [];

  const roleColors: Record<string, string> = { ADMIN: "text-violet-600 bg-violet-500/10", PROVIDER: "text-emerald-600 bg-emerald-500/10", PATIENT: "text-indigo-600 bg-indigo-500/10" };
  const roleLabels: Record<string, string> = { ADMIN: isAr ? "مشرف" : "Admin", PROVIDER: isAr ? "مقدم رعاية" : "Provider", PATIENT: isAr ? "مريض" : "Patient" };

  return (
    <div className="space-y-6 animate-fade-in text-start" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {L.subtitle}
          </p>
        </div>
        <button onClick={fetchStats} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {L.refresh}
          <span className="text-[var(--text-muted)] text-xs">
            {lastUpdate.toLocaleTimeString(isAr ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </button>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-[var(--card-bg)]" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="card p-4 hover:shadow-lg transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs text-[var(--text-muted)] font-medium leading-tight">{label}</p>
                <p className="text-xl font-extrabold mt-1">{value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Registrations */}
            <div className="card p-5 lg:col-span-1">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> {L.chartRegs}
              </h3>
              <div className="h-44">
                {stats?.charts.registrations && <LineChart data={stats.charts.registrations} label={L.chartRegs} color="#6366f1" />}
              </div>
            </div>

            {/* Bookings */}
            <div className="card p-5 lg:col-span-1">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> {L.chartBookings}
              </h3>
              <div className="h-44">
                {stats?.charts.bookings && <BarChart data={stats.charts.bookings} label={L.chartBookings} color="#10b981" />}
              </div>
            </div>

            {/* Appointment Donut */}
            <div className="card p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" /> {L.chartSplit}
              </h3>
              <div className="h-44">
                {appointmentDonut.length > 0 ? (
                  <Doughnut data={appointmentDonut} />
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">{L.noData}</div>
                )}
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-500" /> {L.chartRevenue}
            </h3>
            <div className="h-48">
              {stats?.charts.revenue && <LineChart data={stats.charts.revenue} label="DA" color="#10b981" />}
            </div>
          </div>

          {/* Pending Providers Alert */}
          {stats && stats.users.pendingProviders > 0 && (
            <div className="card p-4 border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                  {stats.users.pendingProviders} {L.alertPending}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{L.alertDesc}</p>
              </div>
              <a href="/admin/providers?status=PENDING" className="ms-auto btn-primary text-xs whitespace-nowrap">
                {L.alertBtn}
              </a>
            </div>
          )}

          {/* Recent Users */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> {L.recentUsers}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {[L.thName, L.thEmail, L.thRole, L.thWilaya, L.thStatus, L.thJoined].map(h => (
                      <th key={h} className="text-start pb-2 text-[var(--text-muted)] font-medium text-xs pe-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {stats?.recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--hover)] transition-colors">
                      <td className="py-2.5 pe-4 font-medium">{u.name}</td>
                      <td className="py-2.5 pe-4 text-[var(--text-muted)]">{u.email}</td>
                      <td className="py-2.5 pe-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="py-2.5 pe-4 text-[var(--text-muted)]">{u.wilaya || "—"}</td>
                      <td className="py-2.5 pe-4">
                        {u.suspended ? (
                          <span className="badge-cancelled text-xs">{L.badgeSuspended}</span>
                        ) : u.approved ? (
                          <span className="badge-confirmed text-xs">{L.badgeActive}</span>
                        ) : (
                          <span className="badge-pending text-xs">{L.badgePending}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-[var(--text-muted)] text-xs">
                        {new Date(u.createdAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/admin/providers", label: L.linkProviders, icon: UserCheck, color: "text-emerald-600" },
              { href: "/admin/patients",  label: L.linkPatients,  icon: Users,     color: "text-indigo-600" },
              { href: "/admin/payments",  label: L.linkPayments,  icon: CreditCard,color: "text-green-600" },
              { href: "/admin/audit-logs",label: L.linkAudit,     icon: FileText,  color: "text-violet-600" },
            ].map(({ href, label, icon: Icon, color }) => (
              <a key={href} href={href} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm font-medium">{label}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
