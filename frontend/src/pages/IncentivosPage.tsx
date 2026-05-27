import { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";
import type { AuthUser } from "../api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Categoria = "Saúde" | "Alimentação" | "Educação" | "Bem-estar" | "Financeiro" | "Geral";
type Status    = "Publicado" | "Rascunho";

interface Incentivo {
  id:        string;
  titulo:    string;
  conteudo:  string;
  categoria: Categoria;
  autor:     string;
  data:      string;
  status:    Status;
  destaque:  boolean;
  vigencia:  string; // data de vigência / validade
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hr_incentivos";

const CATEGORIAS: Categoria[] = ["Saúde", "Alimentação", "Educação", "Bem-estar", "Financeiro", "Geral"];

const CAT_STYLE: Record<Categoria, { bg: string; text: string; icon: string }> = {
  Saúde:       { bg: "#fef2f2", text: "#b91c1c", icon: "🏥" },
  Alimentação: { bg: "#fff7ed", text: "#c2410c", icon: "🍽️" },
  Educação:    { bg: "#eff6ff", text: "#1d4ed8", icon: "🎓" },
  "Bem-estar": { bg: "#f0fdf4", text: "#15803d", icon: "💚" },
  Financeiro:  { bg: "#fdf4ff", text: "#7e22ce", icon: "💰" },
  Geral:       { bg: "var(--color-cinza)", text: "var(--color-text-muted)", icon: "🎁" },
};

const MOCK: Incentivo[] = [
  {
    id: "1",
    titulo: "Bem-vindo ao Portal de Incentivos!",
    conteudo: "Aqui você encontra todos os benefícios e incentivos disponíveis para os colaboradores da DreamSquad.\n\nConsulte regularmente para ficar por dentro das novidades — nosso time de People atualiza este espaço sempre que novos benefícios são ativados ou quando há mudanças nas condições de elegibilidade.",
    categoria: "Geral",
    autor: "Time de People",
    data: new Date().toISOString().split("T")[0],
    vigencia: "",
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

function loadFromStorage(): Incentivo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : MOCK;
  } catch { return MOCK; }
}

function saveToStorage(data: Incentivo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY: Omit<Incentivo, "id"> = {
  titulo: "", conteudo: "", categoria: "Geral",
  autor: "", data: new Date().toISOString().split("T")[0],
  vigencia: "", status: "Publicado", destaque: false,
};

interface ModalProps {
  editing:     Incentivo | null;
  currentUser: AuthUser;
  onClose:     () => void;
  onSave:      (i: Incentivo) => void;
}

function IncentivoModal({ editing, currentUser, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<Omit<Incentivo, "id">>(
    editing
      ? { titulo: editing.titulo, conteudo: editing.conteudo, categoria: editing.categoria,
          autor: editing.autor, data: editing.data, vigencia: editing.vigencia,
          status: editing.status, destaque: editing.destaque }
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
  const focusBorder = "var(--color-primary)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "#fff" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--color-cinza-mid)" }}>
          <h2 className="font-semibold text-base" style={{ color: "var(--color-navy)" }}>
            {editing ? "Editar incentivo" : "Novo incentivo"}
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
                required className={inputCls} style={inputStyle}
                placeholder="Ex: Plano de saúde — novidades 2026"
                value={form.titulo} onChange={(e) => set("titulo", e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
              />
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Descrição *</label>
              <textarea
                required rows={7}
                className={inputCls + " resize-none"} style={inputStyle}
                placeholder="Descreva o incentivo, condições de elegibilidade, como usufruir..."
                value={form.conteudo} onChange={(e) => set("conteudo", e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
              />
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Dica: use linhas em branco para separar parágrafos.
              </p>
            </div>

            {/* Linha: categoria + data + vigência + autor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Categoria</label>
                <select
                  className={inputCls} style={{ ...inputStyle, backgroundColor: "#fff" }}
                  value={form.categoria} onChange={(e) => set("categoria", e.target.value as Categoria)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                >
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Data de publicação</label>
                <input
                  type="date" className={inputCls} style={inputStyle}
                  value={form.data} onChange={(e) => set("data", e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  Vigência até <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  type="date" className={inputCls} style={inputStyle}
                  value={form.vigencia} onChange={(e) => set("vigencia", e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Publicado por</label>
                <input
                  className={inputCls} style={inputStyle}
                  placeholder="Ex: Time de People"
                  value={form.autor} onChange={(e) => set("autor", e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = inputStyle.borderColor; }}
                />
              </div>
            </div>

            {/* Status + destaque */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Status</label>
                <div className="flex gap-2">
                  {(["Publicado", "Rascunho"] as Status[]).map((s) => (
                    <button key={s} type="button" onClick={() => set("status", s)}
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
                  type="checkbox" checked={form.destaque}
                  onChange={(e) => set("destaque", e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--color-text-mid)" }}>⭐ Destacar este incentivo</span>
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0"
            style={{ borderColor: "var(--color-cinza-mid)" }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza-mid)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            >Cancelar</button>
            <button type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {editing ? "Salvar alterações" : "Publicar incentivo"}
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
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Excluir incentivo</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Essa ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-mid)" }}>
          Tem certeza que deseja excluir <strong>"{titulo}"</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-error)" }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  incentivo: Incentivo;
  isAdmin:   boolean;
  featured?: boolean;
  onEdit:    (i: Incentivo) => void;
  onDelete:  (i: Incentivo) => void;
  onExpand:  (i: Incentivo) => void;
}

function IncentivoCard({ incentivo: inc, isAdmin, featured, onEdit, onDelete, onExpand }: CardProps) {
  const cat     = CAT_STYLE[inc.categoria];
  const isDraft = inc.status === "Rascunho";
  const expired = inc.vigencia && inc.vigencia < new Date().toISOString().split("T")[0];

  return (
    <div
      className={`rounded-2xl flex flex-col overflow-hidden transition-all ${featured ? "md:flex-row" : ""}`}
      style={{
        backgroundColor: "#fff",
        border: "1px solid var(--color-cinza-mid)",
        opacity: isDraft || expired ? 0.72 : 1,
        boxShadow: featured ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* Color stripe */}
      <div
        className={`shrink-0 ${featured ? "md:w-1.5 h-1.5 md:h-auto w-full" : "h-1.5"}`}
        style={{ backgroundColor: inc.destaque ? "var(--color-primary)" : cat.text }}
      />

      <div className={`flex flex-col gap-3 p-5 flex-1 ${featured ? "md:p-7" : ""}`}>

        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cat.bg, color: cat.text }}>
              {cat.icon} {inc.categoria}
            </span>
            {inc.destaque && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}>⭐ Destaque</span>
            )}
            {inc.vigencia && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: expired ? "#fef2f2" : "#f0fdf4",
                  color: expired ? "#b91c1c" : "#15803d",
                }}>
                {expired ? "⚠ Expirado" : `Até ${fmtDate(inc.vigencia)}`}
              </span>
            )}
            {isDraft && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-muted)" }}>
                Rascunho
              </span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onEdit(inc)}
                className="p-1.5 rounded-lg text-sm transition-colors" title="Editar"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >✏️</button>
              <button onClick={() => onDelete(inc)}
                className="p-1.5 rounded-lg text-sm transition-colors" title="Excluir"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "var(--color-error)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >🗑️</button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-bold leading-snug ${featured ? "text-xl" : "text-base"}`}
          style={{ color: "var(--color-navy)" }}>
          {inc.titulo}
        </h3>

        {/* Preview */}
        <p className="text-sm leading-relaxed flex-1"
          style={{
            color: "var(--color-text-mid)",
            display: "-webkit-box",
            WebkitLineClamp: featured ? 4 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "pre-line",
          } as React.CSSProperties}>
          {inc.conteudo}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", fontSize: "9px" }}>
              {inc.autor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {inc.autor} · {fmtDate(inc.data)}
            </span>
          </div>
          <button onClick={() => onExpand(inc)}
            className="text-xs font-semibold transition-colors shrink-0"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-primary-dark)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-primary)"; }}
          >Ver mais →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Read modal ───────────────────────────────────────────────────────────────

function ReadModal({ incentivo: inc, onClose }: { incentivo: Incentivo; onClose: () => void }) {
  const cat     = CAT_STYLE[inc.categoria];
  const expired = inc.vigencia && inc.vigencia < new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" style={{ backgroundColor: "#fff" }}>
        <div className="h-1.5 rounded-t-2xl shrink-0"
          style={{ backgroundColor: inc.destaque ? "var(--color-primary)" : cat.text }} />

        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--color-cinza-mid)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cat.bg, color: cat.text }}>{cat.icon} {inc.categoria}</span>
            {inc.vigencia && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: expired ? "#fef2f2" : "#f0fdf4", color: expired ? "#b91c1c" : "#15803d" }}>
                {expired ? "⚠ Expirado" : `Válido até ${fmtDate(inc.vigencia)}`}
              </span>
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
          <h2 className="text-xl font-bold leading-snug" style={{ color: "var(--color-navy)" }}>{inc.titulo}</h2>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))", fontSize: "9px" }}>
              {inc.autor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {inc.autor} · {fmtDate(inc.data)}
            </span>
          </div>
          <div className="text-sm leading-relaxed pt-2"
            style={{ color: "var(--color-text-mid)", whiteSpace: "pre-line", borderTop: "1px solid var(--color-cinza-mid)" }}>
            {inc.conteudo}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props { currentUser: AuthUser }

export function IncentivosPage({ currentUser }: Props) {
  const [incentivos, setIncentivos] = useState<Incentivo[]>(loadFromStorage);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Incentivo | null>(null);
  const [deleting, setDeleting]     = useState<Incentivo | null>(null);
  const [reading, setReading]       = useState<Incentivo | null>(null);
  const [filterCat, setFilterCat]   = useState<"Todos" | Categoria>("Todos");
  const [search, setSearch]         = useState("");

  const isAdmin = currentUser.role === "admin";

  useEffect(() => { saveToStorage(incentivos); }, [incentivos]);

  const visible = incentivos.filter((i) => {
    if (!isAdmin && i.status === "Rascunho") return false;
    const matchCat    = filterCat === "Todos" || i.categoria === filterCat;
    const q           = search.toLowerCase();
    const matchSearch = !q || i.titulo.toLowerCase().includes(q) || i.conteudo.toLowerCase().includes(q) || i.autor.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const featured   = visible.find((i) => i.destaque && i.status === "Publicado");
  const restOfList = visible.filter((i) => i.id !== featured?.id);

  function handleSave(i: Incentivo) {
    setIncentivos((prev) => editing ? prev.map((x) => (x.id === i.id ? i : x)) : [i, ...prev]);
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    setIncentivos((prev) => prev.filter((i) => i.id !== deleting.id));
    setDeleting(null);
  }

  function openNew()           { setEditing(null); setModalOpen(true); }
  function openEdit(i: Incentivo) { setEditing(i); setModalOpen(true); }

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Incentivos">
        {isAdmin && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--color-primary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            <span className="text-base leading-none">+</span>
            Novo incentivo
          </button>
        )}
      </Topbar>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-16">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>🔍</span>
            <input
              className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none transition-all"
              style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff" }}
              placeholder="Buscar incentivos..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; }}
            />
          </div>

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
                {cat !== "Todos" ? `${CAT_STYLE[cat as Categoria].icon} ` : ""}{cat}
              </button>
            ))}
          </div>

          <span className="text-sm shrink-0" style={{ color: "var(--color-text-muted)" }}>
            {visible.length} incentivo{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Empty state */}
        {visible.length === 0 && (
          <div className="rounded-2xl flex flex-col items-center justify-center py-20 gap-3"
            style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}>
            <span className="text-4xl">🎁</span>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              {incentivos.length === 0 ? "Nenhum incentivo cadastrado" : "Nenhum incentivo encontrado"}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {incentivos.length === 0 && isAdmin ? 'Clique em "Novo incentivo" para começar.' : "Tente ajustar os filtros."}
            </p>
            {incentivos.length === 0 && isAdmin && (
              <button onClick={openNew}
                className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}>
                + Novo incentivo
              </button>
            )}
          </div>
        )}

        {/* Featured */}
        {featured && (
          <IncentivoCard
            incentivo={featured} isAdmin={isAdmin} featured
            onEdit={openEdit} onDelete={setDeleting} onExpand={setReading}
          />
        )}

        {/* Grid */}
        {restOfList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restOfList.map((i) => (
              <IncentivoCard
                key={i.id} incentivo={i} isAdmin={isAdmin}
                onEdit={openEdit} onDelete={setDeleting} onExpand={setReading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <IncentivoModal editing={editing} currentUser={currentUser}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <ConfirmDelete titulo={deleting.titulo} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
      )}
      {reading && (
        <ReadModal incentivo={reading} onClose={() => setReading(null)} />
      )}
    </div>
  );
}
