"use client";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Globe, MessageCircle, Camera } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

import logoImg from "@/public/logo.png";

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image src={logoImg} alt="SanadiDZ" className="h-20 md:h-24 w-auto object-contain hover:scale-105 transition-transform" unoptimized />
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              {t("brand_desc")}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors text-[var(--text-muted)]">
                <Globe size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors text-[var(--text-muted)]">
                <MessageCircle size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors text-[var(--text-muted)]">
                <Camera size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t("footer_services")}</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><Link href="/services" className="hover:text-primary-600 transition-colors">{t("footer_home_care")}</Link></li>
              <li><Link href="/services" className="hover:text-primary-600 transition-colors">{t("footer_telemedicine")}</Link></li>
              <li><Link href="/services" className="hover:text-primary-600 transition-colors">{t("footer_coordination")}</Link></li>
              <li><Link href="/services" className="hover:text-primary-600 transition-colors">{t("footer_wellbeing")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t("footer_contact")}</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-center gap-2" style={{ direction: "ltr", justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}><Phone size={14} /> +213 23 XX XX XX</li>
              <li className="flex items-center gap-2" style={{ direction: "ltr", justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}>
                <Mail size={14} />
                <Link href="/contact" className="hover:text-primary-600 transition-colors">contact@sanadidz.dz</Link>
              </li>
              <li className="flex items-center gap-2" style={{ justifyContent: lang === "ar" ? "flex-end" : "flex-start" }}><MapPin size={14} /> {lang === "ar" ? "الجزائر العاصمة، الجزائر" : "Alger, Algérie"}</li>
              <li className="mt-3">
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                  {lang === "ar" ? "تواصل معنا ←" : lang === "en" ? "Contact us →" : "Nous contacter →"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <p>{t("all_rights_reserved")}</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary-600 transition-colors">{t("confidentiality")}</Link>
            <Link href="#" className="hover:text-primary-600 transition-colors">{t("cgu")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
