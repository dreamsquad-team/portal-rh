import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AuthUser, Employee, CreateRequestResult } from "../api/types";
import { Topbar } from "../components/Topbar";

function diffDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

interface Props {
  currentUser: AuthUser;
}

export function VacationRequestPage({ currentUser }: Props) {
  const isAdmin = currentUser.role === "admin";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [employeeEmail, setEmployeeEmail] = useState(isAdmin ? "" : currentUser.email);
  const [contractType, setContractType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateRequestResult | null>(null);

  useEffect(() => {
    api.employees()
      .then((list) => setEmployees(list.filter((e) => e.email)))
      .finally(() => setLoadingEmployees(false));
  }, []);

  useEffect(() => {
    if (startDate && endDate && endDate >= startDate) {
      setDays(diffDays(startDate, endDate));
    } else {
      setDays(null);
    }
  }, [startDate, endDate]);

  function reset() {
    setEmployeeEmail(isAdmin ? "" : currentUser.email);
    setContractType("");
    setStartDate("");
    setDays(null);
    setEndDate("");
    setDays("");
    setError(null);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createRequest({
        employee_email: employeeEmail,
        employee_name: selectedEmployee?.name ?? employeeEmail,
        contract_type: contractType,
        start_date: startDate,
        end_date: endDate,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEmployee = employees.find((e) => e.email === employeeEmail);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Solicitar Recesso" />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 max-w-lg mx-auto">

          {result ? (
            /* ── Success ── */
            <div
              className="rounded-2xl p-8 text-center space-y-4"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl font-bold"
                style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
              >
                ✓
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: "var(--color-text)" }}>
                  Solicitação criada com sucesso!
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {selectedEmployee?.name ?? employeeEmail}
                </p>
              </div>
              <a
                href={result.jira_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-mono font-semibold hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                {result.issue_key} — Abrir no Jira
              </a>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                >
                  Nova solicitação
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 space-y-5"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
            >
              {/* Colaborador */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Colaborador
                </label>
                {isAdmin ? (
                  <select
                    required
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    disabled={loadingEmployees}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      border: "1px solid var(--color-cinza-mid)",
                      color: employeeEmail ? "var(--color-text)" : "var(--color-text-muted)",
                      backgroundColor: "#fff",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                  >
                    <option value="">{loadingEmployees ? "Carregando..." : "Selecione um colaborador"}</option>
                    {employees.map((emp) => (
                      <option key={emp.email} value={emp.email}>{emp.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-medium py-1" style={{ color: "var(--color-text)" }}>
                    {currentUser.name}
                  </p>
                )}
                {selectedEmployee?.current_balance !== null && selectedEmployee !== undefined && (
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Saldo atual: <span className="font-semibold" style={{ color: "var(--color-text)" }}>{selectedEmployee.current_balance} dias</span>
                  </p>
                )}
              </div>

              {/* Contrato de trabalho */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Contrato de trabalho
                </label>
                <select
                  required
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-cinza-mid)",
                    color: contractType ? "var(--color-text)" : "var(--color-text-muted)",
                    backgroundColor: "#fff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                >
                  <option value="">Selecione</option>
                  <option value="Estágio">Estágio</option>
                  <option value="PJ">PJ</option>
                </select>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Data de início
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ border: "1px solid var(--color-cinza-mid)", color: "var(--color-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Data de fim
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{ border: "1px solid var(--color-cinza-mid)", color: "var(--color-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                  />
                </div>
              </div>

              {/* Dias calculados */}
              {days !== null && (
                <div
                  className="rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: "var(--color-cinza)", border: "1px solid var(--color-cinza-mid)" }}
                >
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Dias de férias calculados
                  </span>
                  <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                    {days} {days === 1 ? "dia" : "dias"}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-xs"
                  style={{ backgroundColor: "#fef2f2", color: "var(--color-error)", border: "1px solid #fecaca" }}
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Enviando..." : "Criar solicitação no Jira"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
