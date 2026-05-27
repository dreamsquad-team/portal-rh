import { Topbar } from "../components/Topbar";

interface Props {
  onNavigate: (id: string, filter?: string) => void;
}

interface ModuleCardProps {
  emoji: string;
  title: string;
  description: string;
  onClick?: () => void;
  soon?: boolean;
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

export function Home({ onNavigate }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Dashboard" />

      <div className="p-6 max-w-5xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
            Módulos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModuleCard
              emoji="🏖"
              title="Recesso"
              description="Saldos, pedidos abertos e histórico por colaborador."
              onClick={() => onNavigate("vacations")}
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
            <ModuleCard
              emoji="🛡️"
              title="Administrativo"
              description="Controle de acesso e permissões dos usuários do portal."
              onClick={() => onNavigate("admin")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
