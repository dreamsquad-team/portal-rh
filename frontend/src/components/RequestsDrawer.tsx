import { format, parseISO } from "date-fns";
import type { Employee, VacationRequest } from "../api/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try { return format(parseISO(d), "dd/MM/yyyy"); }
  catch { return d; }
}

function RequestRow({ req }: { req: VacationRequest }) {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ border: "1px solid var(--color-cinza-mid)" }}>
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {[
          ["Início",       formatDate(req.start_date)],
          ["Fim",          formatDate(req.end_date)],
          ["Dias tirados", req.days_taken ?? "—"],
          ["Saldo",        req.balance !== null ? req.balance : "—"],
          ...(req.contract_type ? [["Contrato", req.contract_type]] : []),
          ["Solicitado em", formatDate(req.created_at)],
        ].map(([label, value], i) => (
          <>
            <span key={`l${i}`} style={{ color: "var(--color-text-muted)" }}>{label}</span>
            <span key={`v${i}`} className={label === "Saldo" ? "font-semibold" : ""} style={{ color: "var(--color-text)" }}>
              {value}
            </span>
          </>
        ))}
      </div>
    </div>
  );
}

export function RequestsDrawer({ employee, onClose }: Props) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md flex flex-col overflow-hidden shadow-2xl" style={{ backgroundColor: "#fff" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--color-cinza-mid)" }}>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{employee.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{employee.email}</p>
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

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: "var(--color-cinza-mid)" }}>
          {[
            ["Dias tirados", employee.total_days_taken],
            ["Saldo atual",  employee.current_balance ?? "—"],
            ["Solicitações", employee.requests.length],
          ].map(([label, value]) => (
            <div key={label as string} className="text-center py-4 px-2" style={{ backgroundColor: "var(--color-cinza)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Requests list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {employee.requests.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--color-text-muted)" }}>
              Nenhuma solicitação encontrada.
            </p>
          ) : (
            employee.requests.map((req) => <RequestRow key={req.issue_key} req={req} />)
          )}
        </div>
      </div>
    </div>
  );
}
