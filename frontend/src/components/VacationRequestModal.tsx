import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Employee, CreateRequestResult } from "../api/types";

interface Props {
  employee: Employee;
  onClose: () => void;
}

function diffDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function VacationRequestModal({ employee, onClose }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateRequestResult | null>(null);

  useEffect(() => {
    if (startDate && endDate && endDate >= startDate) {
      setDays(String(diffDays(startDate, endDate)));
    }
  }, [startDate, endDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createRequest({
        employee_email: employee.email,
        start_date: startDate,
        end_date: endDate,
        days: days ? parseInt(days) : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--color-cinza-mid)" }}
        >
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              Solicitar Recesso
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {employee.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-cinza)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {result ? (
            /* Success state */
            <div className="text-center py-4 space-y-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-2xl"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                ✓
              </div>
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Solicitação criada!
              </p>
              <a
                href={result.jira_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-mono font-semibold hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                {result.issue_key}
              </a>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                    Data de início
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      border: "1px solid var(--color-cinza-mid)",
                      color: "var(--color-text)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                    Data de fim
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      border: "1px solid var(--color-cinza-mid)",
                      color: "var(--color-text)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Dias de férias
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Calculado automaticamente"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid var(--color-cinza-mid)",
                    color: "var(--color-text)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
                />
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Calculado automaticamente pelas datas — ajuste se necessário.
                </p>
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-xs"
                  style={{ backgroundColor: "#fef2f2", color: "var(--color-error)", border: "1px solid #fecaca" }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{
                    border: "1px solid var(--color-cinza-mid)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? "Enviando..." : "Solicitar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
