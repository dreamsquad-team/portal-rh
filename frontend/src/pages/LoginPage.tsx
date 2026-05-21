import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api/client";
import type { AuthUser } from "../api/types";

interface Props {
  onLogin: (user: AuthUser) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCredential(credential: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await api.loginWithGoogle(credential);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-2xl font-bold" style={{ color: "var(--color-navy)" }}>Portal RH</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>DreamSquad</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-5"
          style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
        >
          <div className="space-y-1">
            <h1 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
              Entrar
            </h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Use sua conta Google @dreamsquad.com.br para acessar.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Autenticando...
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => {
                  if (res.credential) handleCredential(res.credential);
                }}
                onError={() => setError("Falha ao autenticar com o Google. Tente novamente.")}
                text="signin_with"
                shape="rectangular"
                locale="pt-BR"
                width="280"
              />
            </div>
          )}

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-xs text-center"
              style={{ backgroundColor: "#fef2f2", color: "var(--color-error)", border: "1px solid #fecaca" }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
