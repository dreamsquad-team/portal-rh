import type { Employee, AuthUser, CreateRequestPayload, CreateRequestResult } from "./types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? `HTTP ${res.status}`);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  employees: () => get<Employee[]>("/employees"),
  employee: (email: string) => get<Employee>(`/employees/${encodeURIComponent(email)}`),
  createRequest: (payload: CreateRequestPayload) =>
    post<CreateRequestResult>("/requests", payload),
  loginWithGoogle: (token: string) =>
    post<AuthUser>("/auth/google", { token }),
  adminUsers: () => get<AuthUser[]>("/admin/users"),
  adminSaveUser: (payload: AuthUser) => post<AuthUser>("/admin/users", payload),
  adminDeleteUser: (email: string) => del(`/admin/users/${encodeURIComponent(email)}`),
};
