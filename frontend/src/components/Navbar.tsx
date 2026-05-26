import { useState, useRef, useEffect } from "react";
import type { AuthUser } from "../api/types";

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

function ChevronDown() {
  return (
    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface NavBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function NavBtn({ label, active, onClick, disabled }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? "var(--color-primary)" : "transparent",
        color: active ? "#fff" : disabled ? "var(--color-cinza-mid)" : "var(--color-text-mid)",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
      onMouseLeave={(e) => { if (!active && !disabled) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {label}
    </button>
  );
}

export function Navbar({ active, onNavigate, currentUser, onLogout }: Props) {
  const [recessoOpen, setRecessoOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === "admin";
  const initials = currentUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const recessoItems = [
    ...(isAdmin ? [
      { id: "home",      label: "Dashboard" },
      { id: "vacations", label: "Controle de Recesso" },
    ] : []),
    { id: "request", label: "Solicitar Recesso" },
    { id: "my",      label: "Meus Recessos" },
  ];

  const recessoActive = ["home", "vacations", "request", "my"].includes(active);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRecessoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="h-14 flex items-center px-6 shrink-0 border-b gap-1"
      style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}
    >
      {/* Logo */}
      <div className="mr-5 shrink-0">
        <p className="font-bold text-sm leading-tight" style={{ color: "var(--color-navy)" }}>Portal RH</p>
        <p className="text-xs leading-tight" style={{ color: "var(--color-text-muted)" }}>DreamSquad</p>
      </div>

      {/* Recesso dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setRecessoOpen((o) => !o)}
          className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: recessoActive ? "var(--color-primary)" : "transparent",
            color: recessoActive ? "#fff" : "var(--color-text-mid)",
          }}
          onMouseEnter={(e) => { if (!recessoActive) e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
          onMouseLeave={(e) => { if (!recessoActive) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          Recesso
          <ChevronDown />
        </button>

        {recessoOpen && (
          <div
            className="absolute left-0 top-full mt-1 rounded-xl shadow-lg border z-50 py-1 w-52"
            style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}
          >
            {recessoItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setRecessoOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: active === item.id ? "var(--color-primary)" : "var(--color-text)",
                  fontWeight: active === item.id ? 600 : 400,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <NavBtn label="Onboarding" active={false} onClick={() => {}} disabled />
      <NavBtn label="Benefícios" active={false} onClick={() => {}} disabled />
      <NavBtn label="Comunicados" active={false} onClick={() => {}} disabled />

      {/* Admin: Administrativo */}
      {isAdmin && (
        <NavBtn label="Administrativo" active={active === "admin"} onClick={() => onNavigate("admin")} />
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}
        >
          {initials}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium leading-tight" style={{ color: "var(--color-text)" }}>
            {currentUser.name}
          </p>
          <button
            onClick={onLogout}
            className="text-xs hover:underline leading-tight"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
