import type { Employee } from "./types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  employees: () => get<Employee[]>("/employees"),
  employee: (email: string) => get<Employee>(`/employees/${encodeURIComponent(email)}`),
};
