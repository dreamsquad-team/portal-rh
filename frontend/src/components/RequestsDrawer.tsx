import { format, parseISO } from "date-fns";
import type { Employee, VacationRequest } from "../api/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return format(parseISO(d), "dd/MM/yyyy");
  } catch {
    return d;
  }
}

function RequestRow({ req }: { req: VacationRequest }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <a
          href={req.jira_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium text-sm"
        >
          {req.issue_key}
        </a>
        <StatusBadge status={req.status} category={req.status_category} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-500">Início</span>
        <span>{formatDate(req.start_date)}</span>

        <span className="text-gray-500">Fim</span>
        <span>{formatDate(req.end_date)}</span>

        <span className="text-gray-500">Dias tirados</span>
        <span>{req.days_taken ?? "—"}</span>

        <span className="text-gray-500">Saldo</span>
        <span className="font-semibold">
          {req.balance !== null ? req.balance : "—"}
        </span>

        {req.contract_type && (
          <>
            <span className="text-gray-500">Contrato</span>
            <span>{req.contract_type}</span>
          </>
        )}

        <span className="text-gray-500">Solicitado em</span>
        <span>{formatDate(req.created_at)}</span>
      </div>
    </div>
  );
}

export function RequestsDrawer({ employee, onClose }: Props) {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">{employee.name}</h2>
            <p className="text-xs text-gray-500">{employee.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-4 border-b bg-gray-50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {employee.total_days_taken}
            </p>
            <p className="text-xs text-gray-500">Dias tirados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {employee.current_balance ?? "—"}
            </p>
            <p className="text-xs text-gray-500">Saldo atual</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {employee.requests.length}
            </p>
            <p className="text-xs text-gray-500">Solicitações</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {employee.requests.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              Nenhuma solicitação encontrada.
            </p>
          ) : (
            employee.requests.map((req) => (
              <RequestRow key={req.issue_key} req={req} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
