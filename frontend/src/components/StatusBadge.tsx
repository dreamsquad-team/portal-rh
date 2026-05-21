interface Props {
  status: string;
  category: string;
}

const categoryStyles: Record<string, { bg: string; color: string }> = {
  new:           { bg: "#fff0f5", color: "#ae275c" },
  indeterminate: { bg: "#fff8e6", color: "#b45309" },
  done:          { bg: "#ecfdf5", color: "#047857" },
};

export function StatusBadge({ status, category }: Props) {
  const s = categoryStyles[category] ?? { bg: "#f3f4f5", color: "#574146" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
