import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Employee } from "../api/types";
import { AnniversaryBadge } from "../components/AnniversaryBadge";
import { StatusBadge } from "../components/StatusBadge";
import { RequestsDrawer } from "../components/RequestsDrawer";

type Filter = "all" | "open" | "no_request" | "under_one_year";

function filterLabel(f: Filter) {
  const labels: Record<Filter, string> = {
    all: "Todos",
    open: "Solicitação aberta",
    no_request: "Sem solicitação",
    under_one_year: "Menos de 1 ano",
  };
  return labels[f];
}

function applyFilter(employees: Employee[], filter: Filter, search: string): Employee[] {
  let result = employees;

  if (filter === "open") result = result.filter((e) => e.has_open_request);
  else if (filter === "no_request") result = result.filter((e) => e.requests.length === 0);
  else if (filter === "under_one_year") result = result.filter((e) => !e.completed_one_year);

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }

  return result;
}

export function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Employee | null>(null);

  useEffect(() => {
    api
      .employees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = applyFilter(employees, filter, search);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Controle de Férias</h1>
          <p className="text-sm text-gray-500">Dream Squad &bull; RH</p>
        </div>
        {!loading && !error && (
          <span className="text-sm text-gray-500">
            {employees.length} funcionários
          </span>
        )}
      </header>

      <main className="px-6 py-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {(["all", "open", "no_request", "under_one_year"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filterLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-500">Carregando...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            Erro ao carregar dados: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Funcionário</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tempo de empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Última solicitação</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Dias tirados</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Saldo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Nenhum funcionário encontrado.
                    </td>
                  </tr>
                )}
                {visible.map((emp) => (
                  <tr key={emp.email} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.email}</p>
                      {emp.department && (
                        <p className="text-xs text-gray-400">{emp.department}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AnniversaryBadge
                        admissionDate={emp.admission_date}
                        completedOneYear={emp.completed_one_year}
                        nextAnniversary={emp.next_anniversary}
                        yearsOfService={emp.years_of_service}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.latest_request ? (
                        <div>
                          <p className="text-xs font-mono text-blue-600">
                            {emp.latest_request.issue_key}
                          </p>
                          {emp.latest_request.start_date && (
                            <p className="text-xs text-gray-500">
                              {emp.latest_request.start_date.split("-").reverse().join("/")}
                              {emp.latest_request.end_date &&
                                ` → ${emp.latest_request.end_date.split("-").reverse().join("/")}`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">
                      {emp.total_days_taken > 0 ? emp.total_days_taken : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.current_balance !== null ? (
                        <span
                          className={`font-bold text-base ${
                            emp.current_balance <= 0
                              ? "text-red-600"
                              : emp.current_balance <= 10
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {emp.current_balance}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.latest_request ? (
                        <StatusBadge
                          status={emp.latest_request.status}
                          category={emp.latest_request.status_category}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Sem pedido</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(emp)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
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
      </main>

      <RequestsDrawer employee={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
