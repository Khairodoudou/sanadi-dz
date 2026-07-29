"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  FileText, Plus, Pencil, Trash2, X, Check, User, Search,
  ChevronDown, ChevronUp, Loader2, Stethoscope, Pill, FlaskConical,
  ClipboardList, StickyNote, History,
} from "lucide-react";

interface Patient { id: string; name: string; email: string; phone?: string; wilaya?: string; }
interface MedicalRecord {
  id: string; patientId: string; title: string;
  diagnosis?: string; history?: string; treatments?: string;
  prescriptions?: string; notes?: string; documents?: string;
  labResults?: string; images?: string; date: string; updatedAt: string;
  patient: Patient;
}

const emptyForm = {
  patientEmail: "", patientId: "", title: "",
  diagnosis: "", history: "", treatments: "",
  prescriptions: "", notes: "", labResults: "",
};

export default function ProviderRecordsPage() {
  const { lang, dir } = useLanguage();
  const [records, setRecords]   = useState<MedicalRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<MedicalRecord | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Completed patients for the dropdown
  const [completedPatients, setCompletedPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients]     = useState(false);
  const [selectedPatient, setSelectedPatient]     = useState<Patient | null>(null);

  const L = {
    title:    lang === "ar" ? "الملفات الطبية" : "Dossiers Médicaux",
    subtitle: lang === "ar" ? "إدارة ملفات مرضاك" : "Gérez les dossiers de vos patients",
    add:      lang === "ar" ? "إنشاء ملف طبي" : "Créer un dossier",
    edit:     lang === "ar" ? "تعديل" : "Modifier",
    del:      lang === "ar" ? "حذف" : "Supprimer",
    save:     lang === "ar" ? "حفظ" : "Enregistrer",
    cancel:   lang === "ar" ? "إلغاء" : "Annuler",
    empty:    lang === "ar" ? "لا توجد ملفات طبية بعد" : "Aucun dossier médical",
    search:   lang === "ar" ? "بحث بالمريض أو العنوان..." : "Rechercher par patient ou titre...",
    selectPat:   lang === "ar" ? "اختر المريض..." : "Sélectionner un patient...",
    noCompleted: lang === "ar" ? "لا يوجد مرضى أنهوا استشارة بعد" : "Aucun patient avec consultation terminée",
    fields: {
      title:         lang === "ar" ? "عنوان الملف *" : "Titre du dossier *",
      diagnosis:     lang === "ar" ? "التشخيص" : "Diagnostic",
      history:       lang === "ar" ? "الأنتيسيدان" : "Antécédents",
      treatments:    lang === "ar" ? "العلاجات" : "Traitements",
      prescriptions: lang === "ar" ? "الوصفات" : "Prescriptions",
      notes:         lang === "ar" ? "ملاحظات" : "Notes",
      labResults:    lang === "ar" ? "نتائج التحاليل" : "Résultats d'analyses",
    },
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/provider/records");
      const d = await r.json();
      setRecords(d.records || []);
    } finally { setLoading(false); }
  }, []);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const r = await fetch("/api/provider/completed-patients");
      const d = await r.json();
      setCompletedPatients(d.patients || []);
    } finally { setLoadingPatients(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setSelectedPatient(null);
    loadPatients();
    setShowForm(true);
  }

  function openEdit(r: MedicalRecord) {
    setEditing(r);
    setSelectedPatient(r.patient);
    setForm({
      patientEmail: r.patient.email,
      patientId: r.patientId,
      title: r.title,
      diagnosis: r.diagnosis || "",
      history: r.history || "",
      treatments: r.treatments || "",
      prescriptions: r.prescriptions || "",
      notes: r.notes || "",
      labResults: r.labResults || "",
    });
    setShowForm(true);
  }

  function handlePatientSelect(patientId: string) {
    const p = completedPatients.find((x) => x.id === patientId) || null;
    setSelectedPatient(p);
    setForm((f) => ({ ...f, patientId: p?.id || "", patientEmail: p?.email || "" }));
  }

  async function handleSave() {
    if (!form.patientId || !form.title) return;
    setSaving(true);
    try {
      const url  = editing ? `/api/provider/records/${editing.id}` : "/api/provider/records";
      const meth = editing ? "PATCH" : "POST";
      await fetch(url, { method: meth, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "حذف هذا الملف؟" : "Supprimer ce dossier ?")) return;
    await fetch(`/api/provider/records/${id}`, { method: "DELETE" });
    await load();
  }

  // Group by patient
  const grouped = records
    .filter(r => !search || r.patient.name.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc: Record<string, { patient: Patient; records: MedicalRecord[] }>, r) => {
      if (!acc[r.patientId]) acc[r.patientId] = { patient: r.patient, records: [] };
      acc[r.patientId].records.push(r);
      return acc;
    }, {});

  const sectionClass = "bg-[var(--bg-hover)] rounded-xl p-3";
  const labelClass   = "text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1";

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">{L.title}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">{L.subtitle}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16}/>{L.add}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
        <input className="input w-full ps-9" placeholder={L.search} value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Records grouped by patient */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32}/></div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-20">
          <FileText size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30"/>
          <p className="font-semibold">{L.empty}</p>
          <button onClick={openCreate} className="btn-primary mt-6 inline-flex items-center gap-2">
            <Plus size={16}/>{L.add}
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([pid, { patient, records: recs }]) => (
          <div key={pid} className="card space-y-3">
            {/* Patient header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center text-primary-600 font-bold">
                {patient.name[0]}
              </div>
              <div>
                <p className="font-bold">{patient.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{patient.email}</p>
              </div>
              <span className="ms-auto text-xs text-[var(--text-muted)]">
                {recs.length} {lang === "ar" ? "ملف" : "dossier(s)"}
              </span>
            </div>

            {/* Patient's records */}
            {recs.map((rec) => {
              const isOpen = expanded === rec.id;
              return (
                <div key={rec.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
                  {/* Record header */}
                  <div
                    className="flex items-center justify-between gap-2 p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                    onClick={() => setExpanded(isOpen ? null : rec.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <FileText size={14} className="text-violet-600 dark:text-violet-400"/>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(rec.date).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
                            day: "2-digit", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(rec); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                      ><Pencil size={13}/></button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(rec.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      ><Trash2 size={13}/></button>
                      {isOpen
                        ? <ChevronUp size={14} className="text-[var(--text-muted)]"/>
                        : <ChevronDown size={14} className="text-[var(--text-muted)]"/>
                      }
                    </div>
                  </div>

                  {/* Record detail */}
                  {isOpen && (
                    <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                      {rec.diagnosis    && <div className={sectionClass}><p className={labelClass}><Stethoscope size={11}/>Diagnostic</p><p className="text-sm">{rec.diagnosis}</p></div>}
                      {rec.history      && <div className={sectionClass}><p className={labelClass}><History size={11}/>Antécédents</p><p className="text-sm">{rec.history}</p></div>}
                      {rec.treatments   && <div className={sectionClass}><p className={labelClass}><ClipboardList size={11}/>Traitements</p><p className="text-sm">{rec.treatments}</p></div>}
                      {rec.prescriptions && <div className={sectionClass}><p className={labelClass}><Pill size={11}/>Prescriptions</p><p className="text-sm">{rec.prescriptions}</p></div>}
                      {rec.labResults   && <div className={sectionClass}><p className={labelClass}><FlaskConical size={11}/>Résultats d'analyses</p><p className="text-sm">{rec.labResults}</p></div>}
                      {rec.notes        && <div className={sectionClass + " sm:col-span-2"}><p className={labelClass}><StickyNote size={11}/>Notes</p><p className="text-sm">{rec.notes}</p></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* ── Modal Form ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[var(--border)] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
              <h3 className="text-xl font-bold">{editing ? L.edit : L.add}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors text-[var(--text-muted)]"
              ><X size={20}/></button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* ── Patient selector (create only) ── */}
              {!editing && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {lang === "ar" ? "اختر المريض *" : "Choisir le patient *"}
                  </label>

                  {loadingPatients ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] p-3 rounded-xl border border-[var(--border)]">
                      <Loader2 size={14} className="animate-spin"/>
                      {lang === "ar" ? "جارٍ تحميل المرضى..." : "Chargement des patients..."}
                    </div>
                  ) : completedPatients.length === 0 ? (
                    <div className="p-3 rounded-xl border border-amber-400/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
                      <User size={14}/>
                      {L.noCompleted}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        className="input w-full appearance-none cursor-pointer pe-9"
                        value={form.patientId}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                      >
                        <option value="">{L.selectPat}</option>
                        {completedPatients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.wilaya ? ` · ${p.wilaya}` : ""}{p.phone ? ` · ${p.phone}` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"/>
                    </div>
                  )}

                  {/* Selected patient preview */}
                  {selectedPatient && (
                    <div className="mt-2 flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                        {selectedPatient.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{selectedPatient.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{selectedPatient.email}</p>
                      </div>
                      <Check size={16} className="ms-auto text-emerald-500 shrink-0"/>
                    </div>
                  )}
                </div>
              )}

              {/* Edit mode — patient read-only */}
              {editing && (
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-hover)] rounded-xl">
                  <User size={16} className="text-primary-500"/>
                  <span className="text-sm font-medium">{selectedPatient?.name}</span>
                </div>
              )}

              {/* Fields */}
              {(["title", "diagnosis", "history", "treatments", "prescriptions", "notes", "labResults"] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm font-semibold mb-1">
                    {L.fields[field as keyof typeof L.fields]}
                  </label>
                  {field === "title"
                    ? <input className="input w-full" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}/>
                    : <textarea className="input w-full" rows={3} value={form[field as keyof typeof emptyForm]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}/>
                  }
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] shrink-0">
              <button onClick={() => setShowForm(false)} className="btn-secondary">{L.cancel}</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.patientId || !form.title}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                {L.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
