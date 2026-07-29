"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, CalendarDays, FileText,
  Users, Settings, LogOut, Menu, X, Bell, ChevronDown,
  Stethoscope, BarChart3, ClipboardList, User, Globe, Home, CheckCircle2,
  CreditCard, Star, Shield, UserCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import logoImg from "@/public/logo.png";

interface NavItem { href: string; icon: React.ElementType; labelKey: string; }

const patientNav: NavItem[] = [
  { href: "/patient", icon: LayoutDashboard, labelKey: "dash_sidebar_title" },
  { href: "/patient/service-requests", icon: ClipboardList, labelKey: "dash_sidebar_service_requests" },
  { href: "/patient/bookings", icon: CalendarDays, labelKey: "dash_sidebar_bookings" },
  { href: "/patient/records", icon: FileText, labelKey: "dash_sidebar_records" },
  { href: "/patient/profile", icon: User, labelKey: "dash_sidebar_profile" },
];

const providerNav: NavItem[] = [
  { href: "/provider", icon: LayoutDashboard, labelKey: "dash_sidebar_title" },
  { href: "/provider/services", icon: Stethoscope, labelKey: "dash_sidebar_my_services" },
  { href: "/provider/service-requests", icon: ClipboardList, labelKey: "dash_sidebar_service_requests" },
  { href: "/provider/records", icon: FileText, labelKey: "dash_sidebar_medical_records" },
  { href: "/provider/schedule", icon: CalendarDays, labelKey: "dash_sidebar_schedule" },
  { href: "/provider/profile", icon: User, labelKey: "dash_sidebar_profile" },
];

const adminNav: NavItem[] = [
  { href: "/admin",                icon: BarChart3,     labelKey: "adm_nav_dashboard" },
  { href: "/admin/providers",      icon: UserCheck,     labelKey: "adm_nav_providers" },
  { href: "/admin/patients",       icon: Users,         labelKey: "adm_nav_patients" },
  { href: "/admin/services",       icon: Stethoscope,   labelKey: "adm_nav_services" },
  { href: "/admin/requests",       icon: ClipboardList, labelKey: "adm_nav_requests" },
  { href: "/admin/bookings",       icon: CalendarDays,  labelKey: "adm_nav_bookings" },
  { href: "/admin/records",        icon: FileText,      labelKey: "adm_nav_records" },
  { href: "/admin/payments",       icon: CreditCard,    labelKey: "adm_nav_payments" },
  { href: "/admin/reviews",        icon: Star,          labelKey: "adm_nav_reviews" },
  { href: "/admin/audit-logs",     icon: Shield,        labelKey: "adm_nav_audit" },
  { href: "/admin/settings",       icon: Settings,      labelKey: "adm_nav_settings" },
];

function getNav(role: string) {
  if (role === "ADMIN") return adminNav;
  if (role === "PROVIDER") return providerNav;
  return patientNav;
}

function getRoleColor(role: string) {
  if (role === "ADMIN") return "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20";
  if (role === "PROVIDER") return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  return "text-primary-600 dark:text-primary-400 bg-primary-500/10 border-primary-500/20";
}

function getProfileHref(role: string) {
  if (role === "PROVIDER") return "/provider/profile";
  if (role === "ADMIN") return "/admin";
  return "/patient/profile";
}

export function Sidebar({ user }: { user: { name: string; email?: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, dir, t } = useLanguage();
  const nav = getNav(user.role);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  const isLinkActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/patient" && href !== "/provider" && href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r rtl:border-r-0 rtl:border-l border-[var(--border)] bg-[var(--bg-card)] h-screen sticky top-0" dir={dir}>
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)] flex justify-center">
        <Link href="/" className="flex items-center group">
          <Image src={logoImg} alt="SanadiDZ" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" unoptimized priority />
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate leading-tight">{user.name}</p>
            {user.email && <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${getRoleColor(user.role)}`}>
              {user.role === "ADMIN" ? t("role_admin") : user.role === "PROVIDER" ? t("role_provider") : t("role_patient")}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {user.role === "ADMIN" ? (
          <div className="space-y-4">
            {[
              { label: lang === "ar" ? "الإشراف" : "Supervision",  items: adminNav.slice(0, 1) },
              { label: lang === "ar" ? "الإدارة" : "Gestion",      items: adminNav.slice(1, 7) },
              { label: lang === "ar" ? "المالية" : "Finances",     items: adminNav.slice(7, 10) },
              { label: lang === "ar" ? "الأدوات" : "Outils",       items: adminNav.slice(10) },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2 mb-1">{label}</p>
                <div className="space-y-0.5">
                  {items.map(({ href, icon: Icon, labelKey }) => {
                    const active = isLinkActive(href);
                    return (
                      <Link key={href} href={href}
                        className={`sidebar-item flex items-center gap-3 ${active ? "active bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold" : ""}`}>
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate text-sm">{t(labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {nav.map(({ href, icon: Icon, labelKey }) => {
              const active = isLinkActive(href);
              return (
                <Link key={href} href={href}
                  className={`sidebar-item flex items-center gap-3 ${active ? "active bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold" : ""}`}>
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{t(labelKey)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer / Links */}
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        <Link
          href="/"
          className="sidebar-item flex items-center gap-3 text-xs"
        >
          <Home size={18} className="shrink-0 text-primary-500" />
          <span>{lang === "ar" ? "الرئيسية (الموقع)" : lang === "en" ? "Main Website" : "Site principal"}</span>
        </Link>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-3 text-xs"
        >
          <LogOut size={18} className="shrink-0" />
          <span>{t("nav_logout")}</span>
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ user, title }: { user: { name: string; email?: string; role: string }; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, dir, changeLanguage, t } = useLanguage();
  const nav = getNav(user.role);

  const isLinkActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/patient" && href !== "/provider" && href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  // Translate header titles dynamically
  let displayTitle = title;
  if (title === "Espace Patient" || title === "Patient Portal") displayTitle = t("dash_topbar_patient");
  else if (title === "Espace Prestataire" || title === "Provider Portal") displayTitle = t("dash_topbar_provider");
  else if (title === "Espace Admin" || title === "Admin Portal" || title === "Administration") displayTitle = t("dash_topbar_admin");
  else if (title === "Mon Profil" || title === "My Profile") displayTitle = t("prof_title");
  else if (title === "Mes Rendez-vous" || title === "Mes Appointments" || title === "My Appointments") displayTitle = t("pat_book_title");
  else if (title === "Mon Dossier Médical" || title === "My Medical Records") displayTitle = t("pat_rec_title");
  else if (title === "Demandes" || title === "Demandes d'Intervention" || title === "Intervention Requests") displayTitle = t("prov_req_title");
  else if (title === "Planning" || title === "Mon Planning" || title === "My Schedule") displayTitle = t("prov_sched_title");
  else if (title === "Gestion des Utilisateurs" || title === "Utilisateurs" || title === "User Management") displayTitle = t("adm_usr_title");
  else if (title === "Rendez-vous" || title === "Gestion des Rendez-vous" || title === "Booking Operations") displayTitle = t("adm_bk_title");
  else if (title === "Services" || title === "Gestion des Services" || title === "Service Configurations") displayTitle = t("adm_svc_title");
  else if (title === "Vue d'ensemble" || title === "System Overview") displayTitle = t("adm_dash_title");

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs" dir={dir}>
        {/* Title */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden btn-ghost p-2 rounded-xl" aria-label="Toggle Navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-extrabold text-lg hidden lg:block text-[var(--text)]">{displayTitle}</h1>
          <span className="font-bold text-base lg:hidden text-[var(--text)]">{displayTitle}</span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setUserMenuOpen(false); }}
              className="btn-ghost text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border)]"
              aria-label="Language selector"
            >
              <Globe size={15} className="text-primary-600 dark:text-primary-400" />
              <span className="uppercase font-extrabold">{lang}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl z-20 py-2 animate-scale-in">
                  {[
                    { code: "fr", label: "Français" },
                    { code: "ar", label: "العربية" },
                    { code: "en", label: "English" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => { changeLanguage(item.code as any); setLangOpen(false); }}
                      className={`w-full px-4 py-2 text-xs font-semibold hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-between ${
                        lang === item.code ? "text-primary-600 dark:text-primary-400 bg-primary-500/5 font-extrabold" : ""
                      }`}
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

          {/* Notifications Toggle */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setLangOpen(false); setUserMenuOpen(false); }}
              className="relative btn-ghost p-2 rounded-xl border border-[var(--border)]"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 max-w-[90vw] rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl z-20 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-muted)]">
                    <h4 className="font-extrabold text-sm">{lang === "ar" ? "الإشعارات" : lang === "en" ? "Notifications" : "Notifications"}</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {lang === "ar" ? "تحديد الكل كمقروء" : "Tout marquer lu"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        {lang === "ar" ? "لا توجد إشعارات حالياً." : "Aucune notification pour le moment."}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3 text-xs ${n.read ? "opacity-70" : "bg-primary-500/5 font-semibold"}`}>
                          <p className="text-[var(--text)]">{n.message}</p>
                          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setLangOpen(false); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 px-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs font-bold text-[var(--text)]">{user.name.split(" ")[0]}</span>
              <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl z-20 p-2 animate-scale-in">
                  <div className="p-3 border-b border-[var(--border)] mb-1">
                    <p className="font-extrabold text-sm truncate">{user.name}</p>
                    {user.email && <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${getRoleColor(user.role)}`}>
                      {user.role === "ADMIN" ? t("role_admin") : user.role === "PROVIDER" ? t("role_provider") : t("role_patient")}
                    </span>
                  </div>

                  <Link
                    href={getProfileHref(user.role)}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--bg-muted)] transition-colors"
                  >
                    <User size={15} className="text-primary-600" />
                    <span>{t("prof_title")}</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--bg-muted)] transition-colors"
                  >
                    <Home size={15} className="text-emerald-600" />
                    <span>{lang === "ar" ? "الموقع الرئيسي" : "Site principal"}</span>
                  </Link>

                  <div className="border-t border-[var(--border)] my-1" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>{t("nav_logout")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div
            className="w-72 h-full bg-[var(--bg-card)] border-r rtl:border-r-0 rtl:border-l border-[var(--border)] p-4 flex flex-col shadow-2xl animate-scale-in"
            style={{ float: lang === "ar" ? "right" : "left" }}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            {/* Mobile Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)] mb-4">
              <Link href="/" className="flex items-center group">
                <Image src={logoImg} alt="SanadiDZ" className="h-12 w-auto object-contain" unoptimized />
              </Link>
              <button onClick={() => setMenuOpen(false)} className="btn-ghost p-1.5 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {/* User Banner in Mobile Drawer */}
            <div className="p-3 mb-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-xs truncate">{user.name}</p>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getRoleColor(user.role)}`}>
                  {user.role === "ADMIN" ? t("role_admin") : user.role === "PROVIDER" ? t("role_provider") : t("role_patient")}
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1.5 flex-1 overflow-y-auto">
              {nav.map(({ href, icon: Icon, labelKey }) => {
                const active = isLinkActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`sidebar-item flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold ${
                      active ? "active bg-primary-600 text-white font-bold" : ""
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="truncate">{t(labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions in Drawer */}
            <div className="pt-3 border-t border-[var(--border)] space-y-2 mt-auto">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold hover:bg-[var(--bg-muted)] transition-colors"
              >
                <Home size={18} className="text-primary-600 shrink-0" />
                <span>{lang === "ar" ? "الموقع الرئيسي" : "Site principal"}</span>
              </Link>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} className="shrink-0" />
                <span>{t("nav_logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
