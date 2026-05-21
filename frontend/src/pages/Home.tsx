import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Employee } from "../api/types";
import { Topbar } from "../components/Topbar";

interface Props {
  onNavigate: (id: string, filter?: string) => void;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
  onClick?: () => void;
}

function KpiCard({ label, value, sub, valueColor = "var(--color-text)", onClick }: KpiCardProps) {
  return (
    <div
      className="rounded-xl p-5 border transition-all"
      style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-cinza-mid)", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)"; } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; e.currentTarget.style.boxShadow = "none"; } : undefined}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{sub}</p>}
    </div>
  );
}

export function Home({ onNavigate }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.employees().then(setEmployees).finally(() => setLoading(false));
  }, []);

  const total = employees.length;
  const openRequests = employees.filter((e) => e.has_open_request).length;
  const eligibleWithoutRequest = employees.filter(
    (e) => e.completed_one_year && !e.has_open_request && e.requests.length === 0
  ).length;
  const underOneYear = employees.filter((e) => !e.completed_one_year && e.admission_date).length;

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total de Colaboradores"
            value={loading ? "..." : total}
            sub="na planilha e no Jira"
            onClick={() => onNavigate("vacations", "all")}
          />
          <KpiCard
            label="Solicitações Abertas"
            value={loading ? "..." : openRequests}
            sub="aguardando ou em recesso"
            valueColor="var(--color-primary)"
            onClick={() => onNavigate("vacations", "open")}
          />
          <KpiCard
            label="Aptos sem pedido"
            value={loading ? "..." : eligibleWithoutRequest}
            sub="1 ano cumprido, sem solicitação"
            valueColor="#b45309"
            onClick={() => onNavigate("vacations", "eligible_no_request")}
          />
          <KpiCard
            label="Menos de 1 ano"
            value={loading ? "..." : underOneYear}
            sub="ainda no período aquisitivo"
            valueColor="var(--color-navy-light)"
            onClick={() => onNavigate("vacations", "under_one_year")}
          />
        </div>

        {/* Módulos */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
            Módulos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate("vacations")}
              className="flex items-start gap-4 p-5 rounded-xl border text-left transition-all group"
              style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-cinza-mid)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: "#fff0f5" }}>
                🏖
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  Controle de Recesso
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Saldos, pedidos abertos e histórico por colaborador.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
