import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Employee } from "../api/types";
import { AnniversaryBadge } from "../components/AnniversaryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { RequestsDrawer } from "../components/RequestsDrawer";
import { Topbar } from "../components/Topbar";

type Filter = "all" | "open" | "no_request" | "eligible_no_request" | "under_one_year";

interface Props {
  initialFilter?: string;
}

const FILTER_LABELS: Record<Filter, string> = {
  all: "Todos",
  open: "Solicitação aberta",
  no_request: "Sem solicitação",
  eligible_no_request: "Aptos sem pedido",
  under_one_year: "Menos de 1 ano",
};

function applyFilter(employees: Employee[], filter: Filter, search: string): Employee[] {
  let result = employees;
  if (filter === "open") result = result.filter((e) => e.has_open_request);
  else if (filter === "no_request") result = result.filter((e) => e.requests.length === 0);
  else if (filter === "eligible_no_request") result = result.filter((e) => e.completed_one_year && !e.has_open_request && e.requests.length === 0);
  else if (filter === "under_one_year") result = result.filter((e) => !e.completed_one_year);

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  }
  return result;
}

export function Dashboard({ initialFilter = "all" }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(initialFilter as Filter);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);

  useEffect(() => {
    api.employees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = applyFilter(employees, filter, search);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Controle de Recesso">
        {!loading && !error && (
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {employees.length} colaboradores
          </span>
        )}
      </Topbar>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 max-w-7xl mx-auto space-y-4">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#fff",
                border: "1px solid var(--color-cinza-mid)",
                color: "var(--color-text)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
            />
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: filter === f ? "var(--color-primary)" : "#fff",
                    color: filter === f ? "#fff" : "var(--color-text-mid)",
                    border: `1px solid ${filter === f ? "var(--color-primary)" : "var(--color-cinza-mid)"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== f) e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f) e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
                  }}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Carregando...
            </div>
          )}

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: "#fef2f2", color: "var(--color-error)", border: "1px solid #fecaca" }}>
              Erro ao carregar dados: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-cinza-mid)" }}>
                    {["Colaborador", "Tempo de empresa", "Última solicitação", "Dias tirados", "Saldo", "Status", ""].map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${i >= 3 && i <= 4 ? "text-center" : "text-left"}`}
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-14 text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Nenhum colaborador encontrado.
                      </td>
                    </tr>
                  )}
                  {visible.map((emp) => (
                    <tr
                      key={emp.email || emp.name}
                      className="transition-colors"
                      style={{ borderTop: "1px solid var(--color-cinza)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-cinza)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium" style={{ color: "var(--color-text)" }}>{emp.name}</p>
                        {emp.email && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{emp.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <AnniversaryBadge
                          admissionDate={emp.admission_date}
                          completedOneYear={emp.completed_one_year}
                          nextAnniversary={emp.next_anniversary}
                          yearsOfService={emp.years_of_service}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        {emp.latest_request ? (
                          <div>
                            <p className="text-xs font-mono font-semibold" style={{ color: "var(--color-primary)" }}>
                              {emp.latest_request.issue_key}
                            </p>
                            {emp.latest_request.start_date && (
                              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                {emp.latest_request.start_date.split("-").reverse().join("/")}
                                {emp.latest_request.end_date &&
                                  ` → ${emp.latest_request.end_date.split("-").reverse().join("/")}`}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-cinza-mid)" }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold" style={{ color: "var(--color-text)" }}>
                        {emp.total_days_taken > 0
                          ? emp.total_days_taken
                          : <span style={{ color: "var(--color-cinza-mid)" }}>—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {emp.current_balance !== null ? (
                          <span className="font-bold text-base" style={{
                            color: emp.current_balance <= 0
                              ? "var(--color-error)"
                              : emp.current_balance <= 10
                              ? "#b45309"
                              : "var(--color-success)",
                          }}>
                            {emp.current_balance}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-cinza-mid)" }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {emp.latest_request ? (
                          <StatusBadge status={emp.latest_request.status} category={emp.latest_request.status_category} />
                        ) : (
                          <span className="text-xs" style={{ color: "var(--color-cinza-mid)" }}>Sem pedido</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelected(emp)}
                          className="text-xs font-medium transition-colors"
                          style={{ color: "var(--color-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary-dark)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                        >
                          Ver tudo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RequestsDrawer employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
