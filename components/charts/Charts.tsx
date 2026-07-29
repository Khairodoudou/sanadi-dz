"use client";
import { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
  BarController, DoughnutController, LineController,
} from "chart.js";

Chart.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler, BarController, DoughnutController, LineController
);

export function BarChart({ data, label = "Réservations", color = "#10b981" }: { data: { date: string; count: number }[]; label?: string; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const instance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) instance.current.destroy();
    instance.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: data.map(d => d.date.length > 5 ? d.date.slice(5) : d.date),
        datasets: [{
          label,
          data: data.map(d => d.count),
          backgroundColor: color + "bb",
          borderColor: color,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0f172a", titleColor: "#e2e8f0", bodyColor: "#94a3b8", cornerRadius: 8 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: "rgba(100,116,139,0.1)" }, ticks: { color: "#64748b", font: { size: 10 }, stepSize: 1 } },
        },
      },
    });
    return () => instance.current?.destroy();
  }, [data, label, color]);

  return <canvas ref={ref} />;
}

export function LineChart({ data, label = "Valeur", color = "#6366f1" }: { data: { date: string; amount?: number; count?: number }[]; label?: string; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const instance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) instance.current.destroy();
    instance.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: data.map(d => d.date.length > 5 ? d.date.slice(5) : d.date),
        datasets: [{
          label,
          data: data.map(d => d.amount ?? d.count ?? 0),
          borderColor: color,
          backgroundColor: color + "20",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0f172a", titleColor: "#e2e8f0", bodyColor: "#94a3b8", cornerRadius: 8 } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: "rgba(100,116,139,0.1)" }, ticks: { color: "#64748b", font: { size: 10 } } },
        },
      },
    });
    return () => instance.current?.destroy();
  }, [data, label, color]);

  return <canvas ref={ref} />;
}

export function DoughnutChart({ data }: { data: { nameFr?: string; name?: string; count?: number; value?: number }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const instance = useRef<Chart | null>(null);

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    if (!ref.current) return;
    if (instance.current) instance.current.destroy();
    instance.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.nameFr || d.name || ""),
        datasets: [{
          data: data.map(d => d.count ?? d.value ?? 0),
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#64748b", font: { size: 10 }, padding: 12, usePointStyle: true } },
          tooltip: { backgroundColor: "#0f172a", titleColor: "#e2e8f0", bodyColor: "#94a3b8", cornerRadius: 8 },
        },
      },
    });
    return () => instance.current?.destroy();
  }, [data]);

  return <canvas ref={ref} />;
}
