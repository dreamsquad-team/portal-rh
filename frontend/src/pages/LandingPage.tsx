import { Topbar } from "../components/Topbar";
import type { AuthUser } from "../api/types";

interface Props {
  currentUser: AuthUser;
  onNavigate: (id: string) => void;
}

interface ModuleCardProps {
  emoji: string;
  title: string;
  description: string;
  onClick?: () => void;
  soon?: boolean;
  adminOnly?: boolean;
}

function ModuleCard({ emoji, title, description, onClick, soon }: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex items-start gap-4 p-5 rounded-xl border text-left transition-all w-full"
      style={{
        backgroundColor: "#fff",
        borderColor: "var(--color-cinza-mid)",
        cursor: onClick ? "pointer" : "default",
        opacity: soon ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)";
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: "#fff0f5" }}
      >
        {emoji}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            {title}
          </p>
          {soon && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-muted)" }}
            >
              Em breve
            </span>
          )}
        </div>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {description}
        </p>
      </div>
    </button>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: "#fff0f5" }}
      >
        {icon}
      </span>
      <p className="text-sm leading-relaxed pt-1" style={{ color: "var(--color-text-mid)" }}>
        {text}
      </p>
    </div>
  );
}

export function LandingPage({ currentUser, onNavigate }: Props) {
  const firstName = currentUser.name.split(" ")[0];
  const isAdmin = currentUser.role === "admin";

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Página Inicial" />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-8 pb-16">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-mid) 100%)",
          }}
        >
          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Text */}
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary-light)" }}>
                Portal RH · DreamSquad
              </p>
              <h1 className="text-2xl font-bold text-white leading-snug">
                Olá, <span style={{ color: "var(--color-primary-ui)" }}>{firstName}</span>! 👋
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                Bem-vindo(a) ao <strong className="text-white">Portal de RH da DreamSquad</strong>. Este é o seu ponto central para acessar os módulos de gestão de pessoas — desde recessos e onboarding até comunicados e incentivos.
              </p>
            </div>

            {/* Stats / info pills */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              {[
                { icon: "🏖", label: "Recesso", desc: "Solicite e acompanhe seus recessos" },
                { icon: "🎓", label: "Onboarding", desc: "Guia completo para seus primeiros dias" },
                { icon: "🎁", label: "Incentivos", desc: "Em breve" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{item.label}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sobre o portal ──────────────────────────────────────────── */}
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
            O que você encontra aqui
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureItem
              icon="🏖"
              text="Solicite recessos, consulte seu saldo e acompanhe o histórico de pedidos em tempo real via Jira Service Management."
            />
            <FeatureItem
              icon="🎓"
              text="Acesse o guia de onboarding com agenda, ferramentas, pessoas-chave e materiais de marca para seus primeiros dias."
            />
            <FeatureItem
              icon="📢"
              text="Fique por dentro dos comunicados e avisos internos do RH para todos os colaboradores da DreamSquad."
            />
            <FeatureItem
              icon="🎁"
              text="Consulte os incentivos ativos, vigências e critérios de elegibilidade aplicáveis ao seu perfil."
            />
            {isAdmin && (
              <FeatureItem
                icon="🛡️"
                text="Gerencie permissões e acessos dos colaboradores ao portal pelo módulo Administrativo."
              />
            )}
          </div>
        </div>

        {/* ── Módulos ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
            Módulos disponíveis
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModuleCard
              emoji="🏖"
              title="Recesso"
              description="Saldos, pedidos abertos e histórico por colaborador."
              onClick={() => onNavigate("request")}
            />
            <ModuleCard
              emoji="🎓"
              title="Onboarding"
              description="Checklists e acompanhamento de entrada de novos colaboradores."
              onClick={() => onNavigate("onboarding")}
            />
            <ModuleCard
              emoji="🎁"
              title="Incentivos"
              description="Gestão de incentivos ativos, vigências e elegibilidade por colaborador."
              onClick={() => onNavigate("incentivos")}
            />
            <ModuleCard
              emoji="📢"
              title="Comunicados"
              description="Avisos e comunicações internas do RH para todos os colaboradores."
              onClick={() => onNavigate("comunicados")}
            />
            {isAdmin && (
              <ModuleCard
                emoji="🛡️"
                title="Administrativo"
                description="Controle de acesso e permissões dos usuários do portal."
                onClick={() => onNavigate("admin")}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
