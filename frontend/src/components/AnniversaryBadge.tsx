import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  admissionDate: string | null;
  completedOneYear: boolean;
  nextAnniversary: string | null;
  yearsOfService: number | null;
}

export function AnniversaryBadge({ admissionDate, completedOneYear, nextAnniversary, yearsOfService }: Props) {
  if (!admissionDate) {
    return <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Sem data de admissão</span>;
  }

  const admissionFormatted = format(parseISO(admissionDate), "dd/MM/yyyy");
  const yearsLabel = yearsOfService !== null ? `${yearsOfService.toFixed(1)} anos` : "";

  if (completedOneYear) {
    return (
      <div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
        >
          Apto a tirar férias
        </span>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {admissionFormatted} &bull; {yearsLabel}
        </p>
      </div>
    );
  }

  const anniversaryFormatted = nextAnniversary
    ? format(parseISO(nextAnniversary), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
        style={{ backgroundColor: "#fff8e6", color: "#b45309" }}
      >
        Menos de 1 ano
      </span>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
        {admissionFormatted}
        {anniversaryFormatted && ` • 1 ano em ${anniversaryFormatted}`}
      </p>
    </div>
  );
}
