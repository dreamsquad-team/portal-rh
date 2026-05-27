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

interface DropdownItem { id: string; label: string }

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  active: string;
  isActive: boolean;
  onNavigate: (id: string) => void;
}

function NavDropdown({ label, items, active, isActive, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{
          backgroundColor: isActive ? "var(--color-primary)" : "transparent",
          color: isActive ? "#fff" : "var(--color-text-mid)",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {label}
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 rounded-xl shadow-lg border z-50 py-1 w-56"
          style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setOpen(false); }}
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
  );
}

export function Navbar({ active, onNavigate, currentUser, onLogout }: Props) {
  const isAdmin = currentUser.role === "admin";
  const initials = currentUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const recessoItems: DropdownItem[] = [
    ...(isAdmin ? [{ id: "vacations", label: "Controle de Recesso" }] : []),
    { id: "request", label: "Solicitar Recesso" },
    { id: "my",      label: "Meus Recessos" },
  ];

  const adminItems: DropdownItem[] = [
    { id: "admin",         label: "Acessos" },
    { id: "colaboradores", label: "Gestão de Colaboradores" },
  ];

  const recessoActive = ["home", "vacations", "request", "my"].includes(active);
  const adminActive   = ["admin", "colaboradores"].includes(active);

  return (
    <nav
      className="h-14 flex items-center px-6 shrink-0 border-b gap-1"
      style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate("landing")}
        className="mr-5 shrink-0 text-left transition-opacity hover:opacity-70"
      >
        <p className="font-bold text-sm leading-tight" style={{ color: "var(--color-navy)" }}>Portal RH</p>
        <p className="text-xs leading-tight" style={{ color: "var(--color-text-muted)" }}>DreamSquad</p>
      </button>

      {/* Página Inicial */}
      <NavBtn label="Página Inicial" active={active === "landing"} onClick={() => onNavigate("landing")} />

      {/* Recesso dropdown */}
      <NavDropdown
        label="Recesso"
        items={recessoItems}
        active={active}
        isActive={recessoActive}
        onNavigate={onNavigate}
      />

      <NavBtn label="Onboarding"  active={active === "onboarding"} onClick={() => onNavigate("onboarding")} />
      <NavBtn label="Incentivos"  active={active === "incentivos"} onClick={() => onNavigate("incentivos")} />
      <NavBtn label="Comunicados" active={active === "comunicados"} onClick={() => onNavigate("comunicados")} />

      {/* Admin: Administrativo dropdown */}
      {isAdmin && (
        <NavDropdown
          label="Administrativo"
          items={adminItems}
          active={active}
          isActive={adminActive}
          onNavigate={onNavigate}
        />
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
