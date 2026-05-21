import React from "react";
import type { AuthUser } from "../api/types";

interface NavItem { id: string; label: string; icon: React.ReactNode; }

function IconHome() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function IconBeach() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconCalendarPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const ADMIN_NAV: NavItem[] = [
  { id: "home",      label: "Dashboard",         icon: <IconHome /> },
  { id: "vacations", label: "Controle de Recesso", icon: <IconBeach /> },
  { id: "request",   label: "Solicitar Recesso",   icon: <IconCalendarPlus /> },
  { id: "my",        label: "Meus Recessos",       icon: <IconPerson /> },
  { id: "admin",     label: "Administrativo",     icon: <IconShield /> },
];

const USER_NAV: NavItem[] = [
  { id: "request", label: "Solicitar Recesso", icon: <IconCalendarPlus /> },
  { id: "my",      label: "Meus Recessos",     icon: <IconPerson /> },
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

export function Sidebar({ active, onNavigate, currentUser, onLogout }: Props) {
  const navItems = currentUser.role === "admin" ? ADMIN_NAV : USER_NAV;
  const initials = currentUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="w-56 h-screen flex flex-col shrink-0 border-r"
      style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--color-cinza-mid)" }}>
        <p className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>Portal RH</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>DreamSquad</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "#fff" : "var(--color-text-mid)",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: "var(--color-cinza-mid)" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: "var(--color-text)" }}>
            {currentUser.name}
          </p>
          <button
            onClick={onLogout}
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
