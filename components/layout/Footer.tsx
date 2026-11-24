"use client";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { WhatsAppIcon, FacebookIcon, MessengerIcon } from "@/components/ui/SocialIcons";

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
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-5">
              {t("brand_desc")}
            </p>

            {/* Social & Chat Media Quick Links */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/profile.php?id=61595727873793"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook: Sanadidz"
                aria-label="Facebook SanadiDZ"
                className="w-9 h-9 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all border border-blue-500/20 hover:scale-110 shadow-sm"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/213798693799"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp: +213 798 69 37 99"
                aria-label="WhatsApp SanadiDZ"
                className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-all border border-emerald-500/20 hover:scale-110 shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="https://m.me/61595727873793"
                target="_blank"
                rel="noopener noreferrer"
                title="Messenger: Sanadidz"
                aria-label="Messenger SanadiDZ"
                className="w-9 h-9 rounded-xl bg-sky-500/10 hover:bg-sky-600 text-sky-600 hover:text-white flex items-center justify-center transition-all border border-sky-500/20 hover:scale-110 shadow-sm"
              >
                <MessengerIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:sanadidz2026@gmail.com"
                title="Email: sanadidz2026@gmail.com"
                aria-label="Email SanadiDZ"
                className="w-9 h-9 rounded-xl bg-primary-500/10 hover:bg-primary-600 text-primary-600 hover:text-white flex items-center justify-center transition-all border border-primary-500/20 hover:scale-110 shadow-sm"
              >
                <Mail size={16} />
              </a>
              <a
                href="tel:+213798693799"
                title="Tél: +213 798 69 37 99"
                aria-label="Appeler SanadiDZ"
                className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-600 text-amber-600 hover:text-white flex items-center justify-center transition-all border border-amber-500/20 hover:scale-110 shadow-sm"
              >
                <Phone size={16} />
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
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              <li>
                <a
                  href="tel:+213798693799"
                  className="inline-flex items-center gap-2.5 hover:text-primary-600 transition-colors group"
                >
                  <Phone size={15} className="text-primary-600 dark:text-primary-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium" dir="ltr">+213 798 69 37 99</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/213798693799"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-emerald-600 transition-colors group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium" dir="ltr">+213 798 69 37 99</span>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors">(WhatsApp)</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:sanadidz2026@gmail.com"
                  className="inline-flex items-center gap-2.5 hover:text-primary-600 transition-colors group"
                >
                  <Mail size={15} className="text-primary-600 dark:text-primary-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate" dir="ltr">sanadidz2026@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61595727873793"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 hover:text-blue-600 transition-colors group"
                >
                  <FacebookIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Facebook: Sanadidz</span>
                </a>
              </li>
              <li>
                <div className="inline-flex items-center gap-2.5 pt-1 text-xs text-[var(--text-muted)]">
                  <MapPin size={15} className="text-primary-600 shrink-0" />
                  <span>{lang === "ar" ? "الجزائر العاصمة، الجزائر (69 ولاية)" : "Alger, Algérie (69 wilayas)"}</span>
                </div>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <span>{lang === "ar" ? "تواصل معنا" : lang === "en" ? "Contact us" : "Nous contacter"}</span>
                  <ArrowRight size={13} className={lang === "ar" ? "rotate-180" : ""} />
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
