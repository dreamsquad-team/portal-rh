import { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";
import type { AuthUser } from "../api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Categoria = "Aviso" | "Novidade" | "Evento" | "Incentivo" | "Geral";
type Status    = "Publicado" | "Rascunho";

interface Comunicado {
  id:         string;
  titulo:     string;
  conteudo:   string;
  categoria:  Categoria;
  autor:      string;
  data:       string;   // ISO date
  status:     Status;
  destaque:   boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hr_comunicados";

const CATEGORIAS: Categoria[] = ["Aviso", "Novidade", "Evento", "Incentivo", "Geral"];

const CAT_STYLE: Record<Categoria, { bg: string; text: string }> = {
  Aviso:     { bg: "#fff7ed", text: "#c2410c" },
  Novidade:  { bg: "#eff6ff", text: "#1d4ed8" },
  Evento:    { bg: "#f5f3ff", text: "#6d28d9" },
  Incentivo: { bg: "#d1fae5", text: "#065f46" },
  Geral:     { bg: "var(--color-cinza)", text: "var(--color-text-muted)" },
};

const MOCK: Comunicado[] = [
  {
    id: "1",
    titulo: "Bem-vindos ao Portal de Comunicados!",
    conteudo: "Este é o espaço oficial do time de RH para compartilhar novidades, avisos e informações importantes para todos os colaboradores da DreamSquad.\n\nAqui você encontrará comunicados sobre benefícios, eventos internos, mudanças de processos e muito mais. Fique de olho!",
    categoria: "Novidade",
    autor: "Time de People",
    data: new Date().toISOString().split("T")[0],
    status: "Publicado",
    destaque: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmtDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

function loadFromStorage(): Comunicado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : MOCK;
  } catch {
    return MOCK;
  }
}

function saveToStorage(data: Comunicado[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY: Omit<Comunicado, "id"> = {
  titulo: "", conteudo: "", categoria: "Geral",
  autor: "", data: new Date().toISOString().split("T")[0],
  status: "Publicado", destaque: false,
};

interface ModalProps {
  editing:     Comunicado | null;
  currentUser: AuthUser;
  onClose:     () => void;
  onSave:      (c: Comunicado) => void;
}

function ComunicadoModal({ editing, currentUser, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<Omit<Comunicado, "id">>(
    editing
      ? { titulo: editing.titulo, conteudo: editing.conteudo, categoria: editing.categoria,
          autor: editing.autor, data: editing.data, status: editing.status, destaque: editing.destaque }
      : { ...EMPTY, autor: currentUser.name }
  );

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, id: editing?.id ?? uid() });
  }

  const inputCls = "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all";
  const inputStyle = { borderColor: "var(--color-cinza-mid)", color: "var(--color-text)" };
  const focusStyle = { borderColor: "var(--color-primary)" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--color-cinza-mid)" }}>
          <h2 className="font-semibold text-base" style={{ color: "var(--color-navy)" }}>
            {editing ? "Editar comunicado" : "Novo comunicado"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl leading-none transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-4">

            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Título *</label>
              <input
                required
                className={inputCls}
                style={inputStyle}
                placeholder="Ex: Novo benefício de saúde"
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
              />
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Conteúdo *</label>
              <textarea
                required
                rows={8}
                className={inputCls + " resize-none"}
                style={inputStyle}
                placeholder="Escreva o comunicado aqui..."
                value={form.conteudo}
                onChange={(e) => set("conteudo", e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
              />
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Dica: use linhas em branco para separar parágrafos.
              </p>
            </div>

            {/* Row: categoria + data + autor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Categoria</label>
                <select
                  className={inputCls}
                  style={{ ...inputStyle, backgroundColor: "#fff" }}
                  value={form.categoria}
                  onChange={(e) => set("categoria", e.target.value as Categoria)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                >
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Data</label>
                <input
                  type="date"
                  className={inputCls}
                  style={inputStyle}
                  value={form.data}
                  onChange={(e) => set("data", e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Autor</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Ex: Time de People"
                  value={form.autor}
                  onChange={(e) => set("autor", e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusStyle.borderColor; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                />
              </div>
            </div>

            {/* Row: status + destaque */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Status</label>
                <div className="flex gap-2">
                  {(["Publicado", "Rascunho"] as Status[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                      style={{
                        backgroundColor: form.status === s ? (s === "Publicado" ? "var(--color-primary)" : "var(--color-cinza-mid)") : "#fff",
                        color: form.status === s ? "#fff" : "var(--color-text-mid)",
                        borderColor: form.status === s ? "transparent" : "var(--color-cinza-mid)",
                      }}
                    >
                      {s === "Publicado" ? "✓ Publicado" : "✎ Rascunho"}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(e) => set("destaque", e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--color-text-mid)" }}>
                  ⭐ Destacar este comunicado
                </span>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0"
            style={{ borderColor: "var(--color-cinza-mid)" }}>
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza-mid)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {editing ? "Salvar alterações" : "Publicar comunicado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmDelete({ titulo, onConfirm, onCancel }: { titulo: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4" style={{ backgroundColor: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: "#fef2f2" }}>🗑️</div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Excluir comunicado</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Essa ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-mid)" }}>
          Tem certeza que deseja excluir <strong>"{titulo}"</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-error)" }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card de comunicado ───────────────────────────────────────────────────────

interface CardProps {
  comunicado: Comunicado;
  isAdmin:    boolean;
  onEdit:     (c: Comunicado) => void;
  onDelete:   (c: Comunicado) => void;
  onExpand:   (c: Comunicado) => void;
  featured?:  boolean;
}

function ComunicadoCard({ comunicado: c, isAdmin, onEdit, onDelete, onExpand, featured }: CardProps) {
  const cat = CAT_STYLE[c.categoria];
  const isDraft = c.status === "Rascunho";

  return (
    <div
      className={`rounded-2xl flex flex-col overflow-hidden transition-all ${featured ? "md:flex-row" : ""}`}
      style={{
        backgroundColor: "#fff",
        border: `1px solid ${isDraft ? "var(--color-cinza-mid)" : "var(--color-cinza-mid)"}`,
        opacity: isDraft ? 0.75 : 1,
        boxShadow: featured ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Color stripe */}
      <div
        className={`shrink-0 ${featured ? "md:w-1.5 h-1.5 md:h-auto w-full" : "h-1.5"}`}
        style={{ backgroundColor: c.destaque ? "var(--color-primary)" : cat.bg === "var(--color-cinza)" ? "var(--color-cinza-mid)" : cat.text }}
      />

      <div className={`flex flex-col gap-3 p-5 flex-1 ${featured ? "md:p-7" : ""}`}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cat.bg, color: cat.text }}>
              {c.categoria}
            </span>
            {c.destaque && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}>
                ⭐ Destaque
              </span>
            )}
            {isDraft && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-muted)" }}>
                Rascunho
              </span>
            )}
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(c)}
                className="p-1.5 rounded-lg text-sm transition-colors"
                title="Editar"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >✏️</button>
              <button
                onClick={() => onDelete(c)}
                className="p-1.5 rounded-lg text-sm transition-colors"
                title="Excluir"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "var(--color-error)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >🗑️</button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-bold leading-snug ${featured ? "text-xl" : "text-base"}`}
          style={{ color: "var(--color-navy)" }}
        >
          {c.titulo}
        </h3>

        {/* Content preview */}
        <p
          className="text-sm leading-relaxed flex-1"
          style={{
            color: "var(--color-text-mid)",
            display: "-webkit-box",
            WebkitLineClamp: featured ? 4 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "pre-line",
          } as React.CSSProperties}
        >
          {c.conteudo}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", fontSize: "9px" }}
            >
              {c.autor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {c.autor} · {fmtDate(c.data)}
            </span>
          </div>
          <button
            onClick={() => onExpand(c)}
            className="text-xs font-semibold transition-colors shrink-0"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-dark)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
          >
            Ler mais →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de leitura ─────────────────────────────────────────────────────────

function ReadModal({ comunicado: c, onClose }: { comunicado: Comunicado; onClose: () => void }) {
  const cat = CAT_STYLE[c.categoria];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "#fff" }}>
        {/* Header stripe */}
        <div className="h-1.5 rounded-t-2xl shrink-0"
          style={{ backgroundColor: c.destaque ? "var(--color-primary)" : cat.text }} />

        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--color-cinza-mid)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cat.bg, color: cat.text }}>{c.categoria}</span>
            {c.destaque && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}>⭐ Destaque</span>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl leading-none"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >×</button>
        </div>

        <div className="overflow-y-auto px-6 py-6 space-y-4">
          <h2 className="text-xl font-bold leading-snug" style={{ color: "var(--color-navy)" }}>{c.titulo}</h2>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", fontSize: "9px" }}
            >
              {c.autor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {c.autor} · {fmtDate(c.data)}
            </span>
          </div>
          <div
            className="text-sm leading-relaxed pt-2"
            style={{ color: "var(--color-text-mid)", whiteSpace: "pre-line", borderTop: "1px solid var(--color-cinza-mid)" }}
          >
            {c.conteudo}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  currentUser: AuthUser;
}

export function ComunicadosPage({ currentUser }: Props) {
  const [comunicados, setComunicados] = useState<Comunicado[]>(loadFromStorage);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Comunicado | null>(null);
  const [deleting, setDeleting]       = useState<Comunicado | null>(null);
  const [reading, setReading]         = useState<Comunicado | null>(null);
  const [filterCat, setFilterCat]     = useState<"Todos" | Categoria>("Todos");
  const [search, setSearch]           = useState("");

  const isAdmin = currentUser.role === "admin";

  // Persist on change
  useEffect(() => { saveToStorage(comunicados); }, [comunicados]);

  const visible = comunicados.filter((c) => {
    if (!isAdmin && c.status === "Rascunho") return false;
    const matchCat = filterCat === "Todos" || c.categoria === filterCat;
    const q = search.toLowerCase();
    const matchSearch = !q || c.titulo.toLowerCase().includes(q) || c.conteudo.toLowerCase().includes(q) || c.autor.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const featured   = visible.find((c) => c.destaque && c.status === "Publicado");
  const restOfList = visible.filter((c) => c.id !== featured?.id);

  function handleSave(c: Comunicado) {
    setComunicados((prev) =>
      editing ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev]
    );
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    setComunicados((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  }

  function openNew() { setEditing(null); setModalOpen(true); }
  function openEdit(c: Comunicado) { setEditing(c); setModalOpen(true); }

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Comunicados">
        {isAdmin && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--color-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            <span className="text-base leading-none">+</span>
            Novo comunicado
          </button>
        )}
      </Topbar>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-16">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>🔍</span>
            <input
              className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none transition-all"
              style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff" }}
              placeholder="Buscar comunicados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; }}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {(["Todos", ...CATEGORIAS] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat as "Todos" | Categoria)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={{
                  backgroundColor: filterCat === cat ? "var(--color-primary)" : "#fff",
                  color: filterCat === cat ? "#fff" : "var(--color-text-mid)",
                  borderColor: filterCat === cat ? "var(--color-primary)" : "var(--color-cinza-mid)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-sm shrink-0" style={{ color: "var(--color-text-muted)" }}>
            {visible.length} comunicado{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-20 gap-3"
            style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
          >
            <span className="text-4xl">📢</span>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              {comunicados.length === 0 ? "Nenhum comunicado ainda" : "Nenhum comunicado encontrado"}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {comunicados.length === 0 && isAdmin ? 'Clique em "Novo comunicado" para começar.' : "Tente ajustar os filtros."}
            </p>
            {comunicados.length === 0 && isAdmin && (
              <button
                onClick={openNew}
                className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                + Novo comunicado
              </button>
            )}
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <ComunicadoCard
            comunicado={featured}
            isAdmin={isAdmin}
            featured
            onEdit={openEdit}
            onDelete={setDeleting}
            onExpand={setReading}
          />
        )}

        {/* Rest of posts */}
        {restOfList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restOfList.map((c) => (
              <ComunicadoCard
                key={c.id}
                comunicado={c}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={setDeleting}
                onExpand={setReading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <ComunicadoModal
          editing={editing}
          currentUser={currentUser}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <ConfirmDelete
          titulo={deleting.titulo}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      {reading && (
        <ReadModal
          comunicado={reading}
          onClose={() => setReading(null)}
        />
      )}
    </div>
  );
}
