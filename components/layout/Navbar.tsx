"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, Globe, ChevronDown, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

import logoImg from "@/public/logo.png";

interface UserSession {
  id: string;
  name: string;
  role: string;
}

export function Navbar() {
  const { lang, changeLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "PROVIDER"
      ? "/provider"
      : "/patient";

  const dashboardLabel =
    lang === "ar"
      ? "لوحة التحكم"
      : lang === "en"
      ? "Dashboard"
      : "Tableau de bord";

  const navLinks = [
    ...(user ? [{ href: "/services", label: t("nav_services") }] : []),
    { href: "/about", label: t("nav_about") },
    { href: "/contact", label: t("nav_contact") },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group py-1">
            <Image src={logoImg} alt="SanadiDZ" className="h-16 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform" unoptimized priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="btn-ghost text-sm">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Desktop Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="btn-ghost text-sm flex items-center gap-1.5 px-2 py-1.5"
                aria-label="Change language"
              >
                <Globe size={16} className="text-[var(--text-muted)]" />
                <span className="uppercase font-semibold text-xs">{lang}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl z-20 py-1.5 animate-fade-in">
                    {[
                      { code: "ar", label: "العربية" },
                      { code: "fr", label: "Français" },
                      { code: "en", label: "English" }
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          changeLanguage(item.code as any);
                          setLangOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-xs font-semibold hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-between ${
                          lang === item.code ? 'text-primary-600 dark:text-primary-400 bg-primary-500/5' : 'text-[var(--text)]'
                        }`}
                        style={{ textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                      >
                        {item.label}
                        {lang === item.code && <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <ThemeToggle />
            {user ? (
              <Link href={dashboardHref} className="btn-primary text-sm flex items-center gap-1.5">
                <LayoutDashboard size={16} />
                <span>{dashboardLabel}</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">{t("nav_login")}</Link>
                <Link href="/signup" className="btn-primary text-sm">
                  {t("nav_signup")}
                  <ChevronRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setOpen(!open)} className="btn-ghost p-2">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 flex flex-col gap-2 animate-fade-in">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="sidebar-item" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          
          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-2 p-2 border-y border-[var(--border)] my-1">
            <span className="text-xs text-[var(--text-muted)] font-medium mr-auto">Language:</span>
            <div className="flex gap-1">
              {["ar", "fr", "en"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    changeLanguage(item as any);
                    setOpen(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    lang === item 
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {user ? (
            <Link
              href={dashboardHref}
              className="btn-primary justify-center flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} />
              <span>{dashboardLabel}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary justify-center" onClick={() => setOpen(false)}>{t("nav_login")}</Link>
              <Link href="/signup" className="btn-primary justify-center" onClick={() => setOpen(false)}>
                {t("nav_signup")}
                <ChevronRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}


