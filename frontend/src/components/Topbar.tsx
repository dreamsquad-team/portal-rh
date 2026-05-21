import React from "react";

interface Props {
  title: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: Props) {
  return (
    <div className="h-14 flex items-center justify-between px-6 shrink-0 border-b"
      style={{ backgroundColor: "#fff", borderColor: "var(--color-cinza-mid)" }}>
      <h1 className="text-base font-semibold" style={{ color: "var(--color-primary)" }}>
        {title}
      </h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
