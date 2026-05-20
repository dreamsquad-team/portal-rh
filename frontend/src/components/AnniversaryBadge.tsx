import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  admissionDate: string | null;
  completedOneYear: boolean;
  nextAnniversary: string | null;
  yearsOfService: number | null;
}

export function AnniversaryBadge({
  admissionDate,
  completedOneYear,
  nextAnniversary,
  yearsOfService,
}: Props) {
  if (!admissionDate) {
    return <span className="text-gray-400 text-sm">Sem data de admissão</span>;
  }

  const admissionFormatted = format(parseISO(admissionDate), "dd/MM/yyyy");
  const yearsLabel = yearsOfService !== null ? `${yearsOfService.toFixed(1)} anos` : "";

  if (completedOneYear) {
    return (
      <div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Apto a tirar férias
        </span>
        <p className="text-xs text-gray-500 mt-0.5">
          Admissão: {admissionFormatted} &bull; {yearsLabel}
        </p>
      </div>
    );
  }

  const anniversaryFormatted = nextAnniversary
    ? format(parseISO(nextAnniversary), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
        Menos de 1 ano
      </span>
      <p className="text-xs text-gray-500 mt-0.5">
        Admissão: {admissionFormatted}
        {anniversaryFormatted && ` • 1 ano em ${anniversaryFormatted}`}
      </p>
    </div>
  );
}
