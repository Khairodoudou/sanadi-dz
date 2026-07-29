"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, RefreshCw, ChevronLeft, ChevronRight, Shield, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface RecordMeta {
  id: string; title: string; date: string; updatedAt: string;
  patient: { id: string; name: string; wilaya?: string };
  provider: { id: string; name: string; specialty?: string };
}

export default function AdminRecordsPage() {
  const { lang, dir } = useLanguage();
  const [records, setRecords] = useState<RecordMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "الملفات الطبية" : isEn ? "Medical Records" : "Dossiers Médicaux",
    subtitle: isAr ? `${total} ملف (عرض المراجعة فقط)` : isEn ? `${total} record(s) — Audit view only` : `${total} dossier(s) — Vue audit uniquement`,
    refresh: isAr ? "تحديث" : isEn ? "Refresh" : "Actualiser",

    bannerTitle: isAr ? "السرية الطبية" : isEn ? "Medical Confidentiality" : "Confidentialité Médicale",
    bannerDesc: isAr ? "يطلع المشرف فقط على البيانات الوصفية (المريض، مقدم الرعاية، التاريخ، العنوان). المحتوى الطبي (التشخيص، العلاج، الوصفات) سرّي تماماً ولا يمكن الوصول إليه. يتم تسجيل كل عملية استعراض في سجل المراجعة." : isEn ? "The admin only sees metadata (patient, provider, date, title). Medical content (diagnosis, treatments, prescriptions) is strictly confidential and inaccessible. All views are logged in the audit trail." : "L'administrateur voit uniquement les métadonnées (patient, provider, date, titre). Le contenu médical (diagnostic, traitements, prescriptions) est strictement confidentiel et inaccessible. Toutes les consultations de cette page sont enregistrées dans le journal d'audit.",

    thTitle: isAr ? "العنوان" : isEn ? "Title" : "Titre",
    thPatient: isAr ? "المريض" : isEn ? "Patient" : "Patient",
    thWilaya: isAr ? "الولاية" : isEn ? "Wilaya" : "Wilaya",
    thProvider: isAr ? "مقدم الرعاية" : isEn ? "Provider" : "Provider",
    thSpecialty: isAr ? "التخصص" : isEn ? "Specialty" : "Spécialité",
    thDate: isAr ? "التاريخ" : isEn ? "Date" : "Date",
    thUpdated: isAr ? "آخر تحديث" : isEn ? "Updated At" : "Mis à jour",

    empty: isAr ? "لم يتم العثور على أي ملف" : isEn ? "No records found" : "Aucun dossier trouvé",
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/records?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records); setTotal(data.total); setPages(data.pages);
      }
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return (
    <div className="space-y-5 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={fetchRecords} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {L.refresh}
        </button>
      </div>

      {/* Privacy Banner */}
      <div className="card p-4 border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">{L.bannerTitle}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{L.bannerDesc}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : records.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>{L.empty}</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  {[L.thTitle, L.thPatient, L.thWilaya, L.thProvider, L.thSpecialty, L.thDate, L.thUpdated].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-[var(--text-muted)] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-medium">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.patient.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{r.patient.wilaya || "—"}</td>
                    <td className="px-4 py-3">{r.provider.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{r.provider.specialty || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(r.date).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(r.updatedAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">Page {page} / {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3"><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-sm py-1.5 px-3"><ChevronRight className="w-4 h-4 rtl:rotate-180" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
