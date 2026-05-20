interface Props {
  status: string;
  category: string;
}

const categoryStyles: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  indeterminate: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
};

export function StatusBadge({ status, category }: Props) {
  const style = categoryStyles[category] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
