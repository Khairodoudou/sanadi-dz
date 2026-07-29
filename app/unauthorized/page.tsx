import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { translations, Language } from "@/lib/i18n";

export default async function UnauthorizedPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dict = translations[lang] || translations.fr;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX size={40} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">{dict.unauth_title}</h1>
        <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
          {dict.unauth_desc}
        </p>
        <Link href="/login" className="btn-primary inline-flex justify-center items-center gap-2">
          <ArrowLeft size={16} className={lang === "ar" ? "rotate-180" : ""} /> {dict.unauth_btn}
        </Link>
      </div>
    </div>
  );
}
