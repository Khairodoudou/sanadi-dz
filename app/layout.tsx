import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { HealthChatbot } from "@/components/chatbot/HealthChatbot";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SanadiDZ — Plateforme de Santé à Domicile",
  description:
    "SanadiDZ offre des services de santé à domicile, téléconsultation et coordination de soins pour les Algériens. Prenez soin de vous et de vos proches.",
  keywords: ["santé", "algérie", "soins à domicile", "téléconsultation", "infirmier", "médecin"],
  openGraph: {
    title: "SanadiDZ",
    description: "Votre plateforme de santé en Algérie",
    locale: "fr_DZ",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "fr") as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${lang === "ar" ? "font-arabic" : ""}`}>
        <ThemeProvider>
          <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
          <HealthChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}

