import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { api } from "../api/client";
import type { AuthUser, Employee, VacationRequest } from "../api/types";
import { StatusBadge } from "../components/StatusBadge";
import { Topbar } from "../components/Topbar";

/* ── Chart helpers ─────────────────────────────────────────────── */

interface ChartPoint {
  label: string;
  ts: number;
  balance?: number;     // solid line — historical
  projected?: number;   // dashed line — future
  issueKey?: string;
}

function buildChartData(employee: Employee): ChartPoint[] {
  const sorted = [...employee.requests]
    .filter((r): r is VacationRequest & { start_date: string } =>
      !!r.start_date && r.balance !== null)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const points: ChartPoint[] = [];

  // Infer the balance just before the first request
  if (sorted.length > 0) {
    const first = sorted[0];
    const initial = (first.balance ?? 0) + (first.days_taken ?? 0);
    const beforeDate = new Date(first.start_date);
    beforeDate.setDate(beforeDate.getDate() - 1);
    points.push({ label: format(beforeDate, "dd/MM/yy"), ts: beforeDate.getTime(), balance: initial });
  }

  for (const req of sorted) {
    points.push({
      label: format(parseISO(req.start_date), "dd/MM/yy"),
      ts: parseISO(req.start_date).getTime(),
      balance: req.balance!,
      issueKey: req.issue_key,
    });
  }

  // Today — bridge point between solid and dashed lines
  const now = new Date();
  const currentBalance = employee.current_balance ?? 0;
  const lastTs = points.at(-1)?.ts ?? 0;
  if (now.getTime() > lastTs) {
    points.push({
      label: format(now, "dd/MM/yy"),
      ts: now.getTime(),
      balance: currentBalance,
      projected: currentBalance,
    });
  }

  // Future renewal point (projected)
  if (employee.next_anniversary) {
    const renewalDate = parseISO(employee.next_anniversary);
    if (renewalDate > now) {
      points.push({
        label: format(renewalDate, "dd/MM/yy"),
        ts: renewalDate.getTime(),
        projected: 30,
        issueKey: "Renovação",
      });
    }
  }

  return points.sort((a, b) => a.ts - b.ts);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as ChartPoint;
  const val = payload.find((x: any) => x.value !== undefined)?.value;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-md" style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}>
      <p style={{ color: "var(--color-text-muted)" }}>{label}</p>
      {p.issueKey && <p className="font-mono font-semibold" style={{ color: "var(--color-primary)" }}>{p.issueKey}</p>}
      {val !== undefined && <p className="font-bold" style={{ color: "var(--color-text)" }}>{val} dias</p>}
    </div>
  );
}

function BalanceChart({ employee }: { employee: Employee }) {
  const data = buildChartData(employee);
  const hasData = data.filter((d) => d.balance !== undefined).length >= 2;
  if (!hasData) return null;

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        Evolução do saldo
      </p>
      <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
        Linha sólida: histórico &nbsp;·&nbsp; Linha tracejada: projeção até a próxima renovação
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cinza-mid)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          {/* Solid: historical */}
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
          {/* Dashed: projected future */}
          <Line
            type="monotone"
            dataKey="projected"
            stroke="var(--color-primary)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 4, fill: "#fff", stroke: "var(--color-primary)", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface Props {
  currentUser: AuthUser;
}

function fmt(d: string | null) {
  if (!d) return "—";
  try { return format(parseISO(d), "dd/MM/yyyy"); } catch { return d; }
}

export function MyVacationsPage({ currentUser }: Props) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.employee(currentUser.email)
      .then(setEmployee)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [currentUser.email]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Meus Recessos" />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 max-w-2xl mx-auto space-y-5">

          {loading && (
            <p className="text-sm text-center py-16" style={{ color: "var(--color-text-muted)" }}>Carregando...</p>
          )}

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#fef2f2", color: "var(--color-error)", border: "1px solid #fecaca" }}>
              {error === "Employee not found"
                ? "Seu cadastro ainda não está vinculado ao sistema. Fale com o RH."
                : `Erro: ${error}`}
            </div>
          )}

          {!loading && !error && employee && (
            <>
              {/* Identity card */}
              <div
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 text-white"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}
                >
                  {currentUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{employee.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{employee.email}</p>
                  {employee.admission_date && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      Admissão: {fmt(employee.admission_date)}
                      {employee.years_of_service !== null && ` · ${employee.years_of_service.toFixed(1)} anos`}
                    </p>
                  )}
                </div>
                {employee.completed_one_year && (
                  <span
                    className="ml-auto shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
                  >
                    Apto a tirar férias
                  </span>
                )}
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Dias tirados", value: employee.total_days_taken || "—", color: "var(--color-text)" },
                  {
                    label: "Saldo atual",
                    value: employee.current_balance ?? "—",
                    color: employee.current_balance === null ? "var(--color-text)"
                      : employee.current_balance <= 0 ? "var(--color-error)"
                      : employee.current_balance <= 10 ? "#b45309"
                      : "var(--color-success)",
                  },
                  { label: "Solicitações", value: employee.requests.length, color: "var(--color-primary)" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4 text-center"
                    style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
                  >
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Balance chart */}
              <BalanceChart employee={employee} />

              {/* Renewal info */}
              {employee.next_anniversary && (
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                      Próxima renovação de saldo
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      Aniversário de empresa — novos dias disponíveis a partir de
                    </p>
                  </div>
                  <p
                    className="text-base font-bold shrink-0 ml-4"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {format(parseISO(employee.next_anniversary), "dd/MM/yyyy")}
                  </p>
                </div>
              )}

              {/* Request history */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                  Histórico de solicitações
                </p>

                {employee.requests.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
                  >
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      Nenhuma solicitação encontrada.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employee.requests.map((req) => (
                      <div
                        key={req.issue_key}
                        className="rounded-2xl p-4"
                        style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <a
                            href={req.jira_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold font-mono hover:underline"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {req.issue_key}
                          </a>
                          <StatusBadge status={req.status} category={req.status_category} />
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          {[
                            ["Início",       fmt(req.start_date)],
                            ["Fim",          fmt(req.end_date)],
                            ["Dias tirados", req.days_taken ?? "—"],
                            ["Saldo",        req.balance !== null ? req.balance : "—"],
                            ...(req.contract_type ? [["Contrato", req.contract_type]] : []),
                            ["Solicitado em", fmt(req.created_at)],
                          ].map(([label, value], i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                              <span
                                className={label === "Saldo" ? "font-semibold" : ""}
                                style={{ color: "var(--color-text)" }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
