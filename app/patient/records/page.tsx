import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  FileText, Calendar, User, Stethoscope, History,
  ClipboardList, Pill, FlaskConical, StickyNote, FileCheck,
} from "lucide-react";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";

export default async function PatientRecordsPage() {
  const session = await getSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  const records = await prisma.medicalRecord.findMany({
    where: { patientId: session!.id },
    include: {
      provider: {
        select: { id: true, name: true, avatar: true, wilaya: true, email: true, phone: true },
      },
    },
    orderBy: { date: "desc" },
  });

  // Group records by provider
  const groupedByProvider = records.reduce((acc, rec) => {
    const pId = rec.providerId;
    if (!acc[pId]) {
      acc[pId] = {
        provider: rec.provider,
        records: [],
      };
    }
    acc[pId].records.push(rec);
    return acc;
  }, {} as Record<string, { provider: typeof records[0]["provider"]; records: typeof records }>);

  const L = {
    title: dict.pat_rec_title || (lang === "ar" ? "ملفاتي الطبية" : "Mes Dossiers Médicaux"),
    subtitle: lang === "ar" ? "سجل طبي مفصل منظم حسب الطبيب/المزود" : "Historique médical classé par praticien",
    noRecords: lang === "ar" ? "لا يوجد ملف طبي مسجل" : "Aucun dossier médical disponible",
    providerLabel: lang === "ar" ? "المزود المعالج" : "Praticien",
    diagnosis: lang === "ar" ? "التشخيص" : "Diagnostic",
    history: lang === "ar" ? "السوابق الطبية" : "Antécédents",
    treatments: lang === "ar" ? "العلاجات المتبعة" : "Traitements",
    prescriptions: lang === "ar" ? "الوصفات الطبية" : "Prescriptions",
    notes: lang === "ar" ? "ملاحظات الطبيب" : "Notes du praticien",
    labResults: lang === "ar" ? "نتائج التحاليل والنتائج" : "Résultats d'analyses",
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-2xl font-extrabold">{L.title}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {records.length} {lang === "ar" ? "تقرير متاح" : "rapport(s) disponible(s)"}
        </p>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <p className="font-semibold text-lg">{L.noRecords}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{dict.pat_rec_no_records}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByProvider).map(([pId, group]) => (
            <div key={pId} className="card space-y-4">
              {/* Provider Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center font-bold text-primary-600 text-base">
                  {group.provider.name ? group.provider.name[0] : "P"}
                </div>
                <div>
                  <h3 className="font-bold text-base">{group.provider.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <span>{group.provider.email}</span>
                    {group.provider.phone && <span>• {group.provider.phone}</span>}
                    {group.provider.wilaya && <span>• {group.provider.wilaya}</span>}
                  </p>
                </div>
                <span className="ms-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  {group.records.length} {lang === "ar" ? "ملف" : "dossier(s)"}
                </span>
              </div>

              {/* Records List */}
              <div className="space-y-4">
                {group.records.map((r) => (
                  <div key={r.id} className="border border-[var(--border)] rounded-2xl p-4 space-y-3 bg-[var(--bg-card)]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck size={18} className="text-primary-500" />
                        <h4 className="font-bold text-sm">{r.title}</h4>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Calendar size={12} />
                        {new Date(r.date).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {r.diagnosis && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <Stethoscope size={12} /> {L.diagnosis}
                          </p>
                          <p className="text-sm">{r.diagnosis}</p>
                        </div>
                      )}

                      {r.history && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <History size={12} /> {L.history}
                          </p>
                          <p className="text-sm">{r.history}</p>
                        </div>
                      )}

                      {r.treatments && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <ClipboardList size={12} /> {L.treatments}
                          </p>
                          <p className="text-sm">{r.treatments}</p>
                        </div>
                      )}

                      {r.prescriptions && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <Pill size={12} /> {L.prescriptions}
                          </p>
                          <p className="text-sm">{r.prescriptions}</p>
                        </div>
                      )}

                      {r.labResults && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <FlaskConical size={12} /> {L.labResults}
                          </p>
                          <p className="text-sm">{r.labResults}</p>
                        </div>
                      )}

                      {r.notes && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-3 md:col-span-2">
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                            <StickyNote size={12} /> {L.notes}
                          </p>
                          <p className="text-sm">{r.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
