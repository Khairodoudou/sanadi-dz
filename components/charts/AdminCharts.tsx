"use client";
import dynamic from "next/dynamic";
import { TrendingUp, PieChart } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const BarChart      = dynamic(() => import("@/components/charts/Charts").then(m => ({ default: m.BarChart })),      { ssr: false });
const DoughnutChart = dynamic(() => import("@/components/charts/Charts").then(m => ({ default: m.DoughnutChart })), { ssr: false });

interface Props {
  weeklyBookings: { date: string; count: number }[];
  categoryData:   { nameFr: string; count: number }[];
}

export function AdminCharts({ weeklyBookings, categoryData }: Props) {
  const { lang } = useLanguage();

  const chartTitle     = lang === "ar" ? "الحجوزات (آخر 7 أيام)"   : lang === "en" ? "Bookings (Last 7 Days)"    : "Réservations (7 derniers jours)";
  const chartSubtitle  = lang === "ar" ? "عدد الحجوزات يومياً"       : lang === "en" ? "Number of bookings per day" : "Nombre de réservations par jour";
  const pieTitle       = lang === "ar" ? "التوزيع حسب الخدمة"        : lang === "en" ? "Breakdown by Service"       : "Répartition par service";
  const pieSubtitle    = lang === "ar" ? "أكثر 5 خدمات حجزاً"         : lang === "en" ? "Top 5 most booked services" : "Top 5 services les plus réservés";
  const noData         = lang === "ar" ? "لا توجد بيانات"              : lang === "en" ? "No data available"          : "Aucune donnée";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-bold mb-1 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600 dark:text-primary-400" />
          {chartTitle}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">{chartSubtitle}</p>
        <div className="h-52">
          <BarChart data={weeklyBookings} />
        </div>
      </div>
      <div className="card">
        <h3 className="font-bold mb-1 flex items-center gap-2">
          <PieChart size={18} className="text-accent-500" />
          {pieTitle}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">{pieSubtitle}</p>
        <div className="h-52">
          {categoryData.length > 0
            ? <DoughnutChart data={categoryData} />
            : <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">{noData}</div>
          }
        </div>
      </div>
    </div>
  );
}
