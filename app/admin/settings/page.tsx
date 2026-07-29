"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SettingsMap { [key: string]: string }

const DEFAULT_SETTINGS: SettingsMap = {
  platform_name:        "SanadiDZ",
  platform_email:       "contact@sanadidz.dz",
  platform_phone:       "+213 XXX XXX XXX",
  platform_address:     "Alger, Algérie",
  platform_commission:  "10",
  platform_tva:         "0",
  platform_facebook:    "",
  platform_instagram:   "",
  platform_linkedin:    "",
  smtp_host:            "",
  smtp_port:            "587",
  smtp_user:            "",
  terms_url:            "",
  privacy_url:          "",
};

interface SettingGroup {
  title: string;
  keys: string[];
  labels: Record<string, string>;
  types?: Record<string, string>;
}

export default function AdminSettingsPage() {
  const { lang, dir } = useLanguage();
  const [settings, setSettings] = useState<SettingsMap>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const isAr = lang === "ar";
  const isEn = lang === "en";

  const L = {
    title: isAr ? "إعدادات المنصة" : isEn ? "Platform Settings" : "Paramètres de la Plateforme",
    subtitle: isAr ? "الإعدادات العامة لـ صنادي دي زد" : isEn ? "Global configuration for SanadiDZ" : "Configuration globale de SanadiDZ",
    saveBtn: isAr ? "حفظ الكل" : isEn ? "Save all" : "Enregistrer tout",
    savingBtn: isAr ? "جاري الحفظ..." : isEn ? "Saving..." : "Enregistrement...",
    savedBtn: isAr ? "تم الحفظ!" : isEn ? "Saved!" : "Enregistré !",

    previewTitle: isAr ? "معاينة" : isEn ? "Preview" : "Aperçu",
    previewPlatform: isAr ? "المنصة" : isEn ? "Platform" : "Plateforme",
    previewCommission: isAr ? "العمولة" : isEn ? "Commission" : "Commission",
    previewTva: isAr ? "الضريبة" : isEn ? "VAT" : "TVA",
  };

  const SETTING_GROUPS: SettingGroup[] = [
    {
      title: isAr ? "معلومات عامة" : isEn ? "General Information" : "Informations Générales",
      keys: ["platform_name", "platform_email", "platform_phone", "platform_address"],
      labels: {
        platform_name: isAr ? "اسم المنصة" : "Nom de la plateforme",
        platform_email: isAr ? "البريد الإلكتروني للتواصل" : "Email de contact",
        platform_phone: isAr ? "رقم الهاتف" : "Téléphone",
        platform_address: isAr ? "العنوان" : "Adresse",
      },
    },
    {
      title: isAr ? "المالية والعمولة" : isEn ? "Finances & Commission" : "Finances & Commission",
      keys: ["platform_commission", "platform_tva"],
      labels: {
        platform_commission: isAr ? "عمولة المنصة (%)" : "Commission plateforme (%)",
        platform_tva: isAr ? "الضريبة على القيمة المضافة (%)" : "TVA (%)",
      },
      types: { platform_commission: "number", platform_tva: "number" },
    },
    {
      title: isAr ? "شبكات التواصل الاجتماعي" : isEn ? "Social Networks" : "Réseaux Sociaux",
      keys: ["platform_facebook", "platform_instagram", "platform_linkedin"],
      labels: {
        platform_facebook: "Facebook URL",
        platform_instagram: "Instagram URL",
        platform_linkedin: "LinkedIn URL",
      },
    },
    {
      title: isAr ? "إعدادات SMTP البريدية" : isEn ? "SMTP Configuration" : "Configuration SMTP",
      keys: ["smtp_host", "smtp_port", "smtp_user"],
      labels: {
        smtp_host: isAr ? "خادم SMTP" : "Serveur SMTP",
        smtp_port: isAr ? "المنفذ (Port)" : "Port",
        smtp_user: isAr ? "اسم المستخدم" : "Utilisateur SMTP",
      },
      types: { smtp_port: "number" },
    },
    {
      title: isAr ? "روابط قانونية" : isEn ? "Legal Links" : "Légal",
      keys: ["terms_url", "privacy_url"],
      labels: {
        terms_url: isAr ? "رابط شروط الاستخدام" : "URL Conditions d'utilisation",
        privacy_url: isAr ? "رابط سياسة الخصوصية" : "URL Politique de confidentialité",
      },
    },
  ];

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in text-start" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{L.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{L.subtitle}</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? L.savingBtn : saved ? L.savedBtn : L.saveBtn}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-5">
          {SETTING_GROUPS.map(group => (
            <div key={group.title} className="card p-6 space-y-4">
              <h3 className="font-bold text-sm border-b border-[var(--border)] pb-2 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-500" /> {group.title}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.keys.map(key => (
                  <div key={key}>
                    <label className="label text-xs">{group.labels[key]}</label>
                    <input
                      type={group.types?.[key] || "text"}
                      className="input w-full"
                      value={settings[key] || ""}
                      onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={DEFAULT_SETTINGS[key] || ""}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Preview */}
          <div className="card p-6">
            <h3 className="font-bold text-sm border-b border-[var(--border)] pb-2 mb-4">{L.previewTitle}</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-muted)] text-xs">{L.previewPlatform}</p>
                <p className="font-bold text-lg">{settings.platform_name || "SanadiDZ"}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs">{L.previewCommission}</p>
                <p className="font-bold text-lg">{settings.platform_commission || 10}%</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs">{L.previewTva}</p>
                <p className="font-bold text-lg">{settings.platform_tva || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
