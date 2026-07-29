"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Plus, Pencil, Trash2, X, Check, Stethoscope, Clock, Banknote,
  MapPin, Tag, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";

interface Service {
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
  wilaya: string | null;
}

const CATEGORIES = [
  "Soins infirmiers", "Médecine générale", "Kinésithérapie",
  "Psychologie", "Nutrition", "Pédiatrie", "Cardiologie", "Autre",
];

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
  "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

const ICONS = ["🩺","💊","🏥","🦷","🫀","🧠","🦴","💉","🩻","👁️","🫁","🤝","🧘","🥗","👶","💪"];

const empty: Omit<Service, "id"> = {
  name: "", nameAr: "", nameFr: "",
  category: CATEGORIES[0], description: "", descFr: "",
  icon: "🩺", price: 0, duration: 30, available: true, wilaya: null,
};

export default function ProviderServicesPage() {
  const { lang, t, dir } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Service | null>(null);
  const [form, setForm]         = useState<Omit<Service, "id">>(empty);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const label = {
    title:   lang === "ar" ? "خدماتي" : lang === "en" ? "My Services" : "Mes Services",
    subtitle:lang === "ar" ? "إدارة خدماتك المهنية" : lang === "en" ? "Manage your professional services" : "Gérez vos services professionnels",
    add:     lang === "ar" ? "إضافة خدمة" : lang === "en" ? "Add Service" : "Ajouter un service",
    edit:    lang === "ar" ? "تعديل" : lang === "en" ? "Edit" : "Modifier",
    del:     lang === "ar" ? "حذف" : lang === "en" ? "Delete" : "Supprimer",
    save:    lang === "ar" ? "حفظ" : lang === "en" ? "Save" : "Enregistrer",
    cancel:  lang === "ar" ? "إلغاء" : lang === "en" ? "Cancel" : "Annuler",
    noSrv:   lang === "ar" ? "لا توجد خدمات بعد" : lang === "en" ? "No services yet" : "Aucun service pour l'instant",
    empty:   lang === "ar" ? "أضف خدمتك الأولى" : lang === "en" ? "Add your first service" : "Ajoutez votre premier service",
    nameFr:  lang === "ar" ? "الاسم (بالفرنسية)" : "Nom (Français)",
    nameAr:  lang === "ar" ? "الاسم (بالعربية)" : "Nom (Arabe)",
    nameEn:  lang === "ar" ? "الاسم (بالإنجليزية)" : "Nom (Anglais)",
    categ:   lang === "ar" ? "الفئة" : "Catégorie",
    price:   lang === "ar" ? "السعر (دج)" : "Prix (DA)",
    dur:     lang === "ar" ? "المدة (دقيقة)" : "Durée (min)",
    wil:     lang === "ar" ? "الولاية" : "Wilaya",
    desc:    lang === "ar" ? "الوصف" : "Description",
    avail:   lang === "ar" ? "متاح" : "Disponible",
    icon:    lang === "ar" ? "الأيقونة" : "Icône",
  };

  async function loadServices() {
    setLoading(true);
    try {
      const r = await fetch("/api/provider/services");
      const d = await r.json();
      setServices(d.services || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadServices(); }, []);

  function openCreate() { setEditing(null); setForm(empty); setErrors({}); setShowForm(true); }
  function openEdit(s: Service) { setEditing(s); setForm({ name: s.name, nameAr: s.nameAr, nameFr: s.nameFr, category: s.category, description: s.description, descFr: s.descFr, icon: s.icon, price: s.price, duration: s.duration, available: s.available, wilaya: s.wilaya }); setErrors({}); setShowForm(true); }

  function validate() {
    const newErrors: Record<string, string> = {};
    const errMsg = (ar: string, fr: string) => lang === "ar" ? ar : fr;
    if (!form.nameFr.trim())
      newErrors.nameFr = errMsg("الاسم بالفرنسية مطلوب", "Le nom en français est obligatoire");
    if (!form.category)
      newErrors.category = errMsg("الفئة مطلوبة", "La catégorie est obligatoire");
    if (!form.price || form.price <= 0)
      newErrors.price = errMsg("يجب أن يكون السعر أكبر من 0", "Le prix doit être supérieur à 0");
    if (!form.duration || form.duration < 5)
      newErrors.duration = errMsg("المدة يجب أن تكون 5 دقائق على الأقل", "La durée doit être d'au moins 5 minutes");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const url  = editing ? `/api/provider/services/${editing.id}` : "/api/provider/services";
      const meth = editing ? "PATCH" : "POST";
      const payload = { ...form, name: form.nameFr || form.name };
      await fetch(url, { method: meth, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setShowForm(false);
      await loadServices();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "هل تريد حذف هذه الخدمة؟" : "Supprimer ce service ?")) return;
    setDeleting(id);
    await fetch(`/api/provider/services/${id}`, { method: "DELETE" });
    setDeleting(null);
    await loadServices();
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">{label.title}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">{label.subtitle}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> {label.add}
        </button>
      </div>

      {/* Services grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
      ) : services.length === 0 ? (
        <div className="card text-center py-20">
          <Stethoscope size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <p className="font-semibold text-lg">{label.noSrv}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{label.empty}</p>
          <button onClick={openCreate} className="btn-primary mt-6 inline-flex items-center gap-2"><Plus size={16}/>{label.add}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="card hover:border-primary-500/40 transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{lang === "ar" ? s.nameAr : s.nameFr || s.name}</h3>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-full">{s.category}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"><Pencil size={14}/></button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                    {deleting === s.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  </button>
                </div>
              </div>

              {s.description && <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-2">{lang === "ar" ? s.description : s.descFr || s.description}</p>}

              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Banknote size={14}/>{s.price.toLocaleString()} DA
                </span>
                <span className="flex items-center gap-1 text-[var(--text-muted)]">
                  <Clock size={14}/>{s.duration} min
                </span>
                {s.wilaya && <span className="flex items-center gap-1 text-[var(--text-muted)]"><MapPin size={14}/>{s.wilaya}</span>}
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                {s.available
                  ? <><ToggleRight size={16} className="text-emerald-500"/><span className="text-xs text-emerald-600 dark:text-emerald-400">{lang === "ar" ? "متاح" : "Disponible"}</span></>
                  : <><ToggleLeft  size={16} className="text-[var(--text-muted)]"/><span className="text-xs text-[var(--text-muted)]">{lang === "ar" ? "غير متاح" : "Indisponible"}</span></>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-[var(--border)] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg-card)] shrink-0">
              <h3 className="text-xl font-bold">{editing ? label.edit : label.add}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20}/></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-semibold mb-2">{label.icon}</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`text-2xl p-2.5 rounded-xl border-2 transition-all ${form.icon === ic ? "border-primary-500 bg-primary-500/10 scale-105" : "border-[var(--border)] hover:border-primary-500/50"}`}>{ic}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.nameFr} <span className="text-red-500">*</span></label>
                  <input
                    className={`input w-full text-start transition-colors ${errors.nameFr ? "border-red-500 focus:border-red-500 bg-red-500/5" : ""}`}
                    dir="ltr"
                    value={form.nameFr}
                    onChange={e => { setForm(f => ({ ...f, nameFr: e.target.value, name: e.target.value })); if (errors.nameFr) setErrors(er => ({ ...er, nameFr: "" })); }}
                    placeholder="Ex: Soins infirmiers à domicile"
                  />
                  {errors.nameFr && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.nameFr}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.nameAr}</label>
                  <input className="input w-full text-start" dir="rtl" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: تمريض منزلي"/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.categ} <span className="text-red-500">*</span></label>
                  <select
                    className={`input w-full transition-colors ${errors.category ? "border-red-500 focus:border-red-500 bg-red-500/5" : ""}`}
                    value={form.category}
                    onChange={e => { setForm(f => ({ ...f, category: e.target.value })); if (errors.category) setErrors(er => ({ ...er, category: "" })); }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.wil}</label>
                  <select className="input w-full" value={form.wilaya || ""} onChange={e => setForm(f => ({ ...f, wilaya: e.target.value || null }))}>
                    <option value="">{lang === "ar" ? "كل الولايات" : "Toutes les wilayas"}</option>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.price} <span className="text-red-500">*</span></label>
                  <input
                    className={`input w-full transition-colors ${errors.price ? "border-red-500 focus:border-red-500 bg-red-500/5" : ""}`}
                    type="number" min="0"
                    value={form.price}
                    onChange={e => { setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 })); if (errors.price) setErrors(er => ({ ...er, price: "" })); }}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{label.dur} <span className="text-red-500">*</span></label>
                  <input
                    className={`input w-full transition-colors ${errors.duration ? "border-red-500 focus:border-red-500 bg-red-500/5" : ""}`}
                    type="number" min="5" step="5"
                    value={form.duration}
                    onChange={e => { setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 })); if (errors.duration) setErrors(er => ({ ...er, duration: "" })); }}
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.duration}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">{label.desc}</label>
                <textarea className="input w-full" rows={3} value={form.descFr} onChange={e => setForm(f => ({ ...f, descFr: e.target.value, description: e.target.value }))} placeholder="Décrivez votre service..."/>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center shrink-0 cursor-pointer ${
                    form.available ? "bg-emerald-500 justify-end" : "bg-gray-300 dark:bg-gray-600 justify-start"
                  }`}
                >
                  <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md transition-all"/>
                </button>
                <span className="text-sm font-semibold">{label.avail}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-card)] shrink-0">
              <button onClick={() => setShowForm(false)} className="btn-secondary">{label.cancel}</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                {label.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
