import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AuthUser } from "../api/types";
import { Topbar } from "../components/Topbar";

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", user: "Usuário" };
const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#fff0f5", color: "#ae275c" },
  user:  { bg: "#f0f4ff", color: "#1a2d7a" },
};

interface Props {
  currentUser: AuthUser;
}

export function AdminPage({ currentUser }: Props) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setUsers(await api.adminUsers()); } finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await api.adminSaveUser({ email: email.trim().toLowerCase(), name: name.trim(), role });
      setEmail(""); setName(""); setRole("user");
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(targetEmail: string) {
    if (targetEmail === currentUser.email) return;
    await api.adminDeleteUser(targetEmail);
    await load();
  }

  async function handleToggleRole(user: AuthUser) {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (user.email === currentUser.email && newRole !== "admin") return;
    await api.adminSaveUser({ ...user, role: newRole });
    await load();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Administrativo" />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 max-w-2xl mx-auto space-y-6">

          {/* Add user form */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Adicionar / atualizar usuário
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--color-cinza-mid)", color: "var(--color-text)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
              />
              <input
                type="text"
                required
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--color-cinza-mid)", color: "var(--color-text)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid var(--color-cinza-mid)", color: "var(--color-text)", backgroundColor: "#fff" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cinza-mid)")}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {formError && (
              <p className="text-xs" style={{ color: "var(--color-error)" }}>{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>

          {/* Users table */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-cinza-mid)" }}>
                  {["Nome", "E-mail", "Papel", ""].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      Carregando...
                    </td>
                  </tr>
                )}
                {!loading && users.map((u) => {
                  const s = ROLE_STYLES[u.role] ?? ROLE_STYLES.user;
                  const isSelf = u.email === currentUser.email;
                  return (
                    <tr
                      key={u.email}
                      style={{ borderTop: "1px solid var(--color-cinza)" }}
                    >
                      <td className="px-5 py-3.5 font-medium" style={{ color: "var(--color-text)" }}>
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 text-xs" style={{ color: "var(--color-text-muted)" }}>(você)</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "var(--color-text-muted)" }}>{u.email}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={isSelf}
                          title={isSelf ? "Não é possível alterar seu próprio papel" : "Clique para alternar"}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-opacity"
                          style={{ backgroundColor: s.bg, color: s.color, opacity: isSelf ? 0.6 : 1, cursor: isSelf ? "default" : "pointer" }}
                        >
                          {ROLE_LABELS[u.role]}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(u.email)}
                            className="text-xs transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                          >
                            Remover
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
