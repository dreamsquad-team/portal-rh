import { useState, useEffect } from "react";
import { Topbar } from "../components/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Contrato = "CLT" | "PJ" | "Estágio" | "Freelance";
type Status   = "Ativo" | "Inativo";

interface Endereco {
  cep:         string;
  rua:         string;
  numero:      string;
  complemento: string;
  bairro:      string;
  cidade:      string;
  estado:      string;
}

interface Colaborador {
  id:            string;
  nomeCompleto:  string;
  email:         string;
  cargo:         string;
  departamento:  string;
  squad:         string;
  tipoContrato:  Contrato;
  dataAdmissao:  string;
  salario:       string;
  cpf:           string;
  telefone:      string;
  status:        Status;
  endereco:      Endereco;
  observacoes:   string;
}

const EMPTY_ENDERECO: Endereco = { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };

const EMPTY_FORM: Omit<Colaborador, "id"> = {
  nomeCompleto: "", email: "", cargo: "", departamento: "", squad: "",
  tipoContrato: "CLT", dataAdmissao: "", salario: "",
  cpf: "", telefone: "", status: "Ativo",
  endereco: { ...EMPTY_ENDERECO }, observacoes: "",
};

const DEPARTAMENTOS = ["Backoffice", "Engenharia", "IA", "Board", "Comercial", "Marketing", "Financeiro", "Jurídico", "RH", "Operações"];
const CONTRATOS: Contrato[] = ["CLT", "PJ", "Estágio", "Freelance"];

const SQUADS_KEY = "hr_squads";
const DEFAULT_SQUADS = ["Apollo", "Ares", "Athena", "Atlas", "Jaú", "Magna", "Ômega"];

function loadSquads(): string[] {
  try {
    const raw = localStorage.getItem(SQUADS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SQUADS;
  } catch { return DEFAULT_SQUADS; }
}

function saveSquads(squads: string[]) {
  localStorage.setItem(SQUADS_KEY, JSON.stringify(squads));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmtSalario(v: string) {
  const n = parseFloat(v.replace(/\D/g, "")) / 100;
  if (isNaN(n)) return "";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all";
const inputStyle = { borderColor: "var(--color-cinza-mid)", color: "var(--color-text)" };

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={inputCls}
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; props.onBlur?.(e); }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputCls}
      style={{ ...inputStyle, backgroundColor: "#fff" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; props.onBlur?.(e); }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className={inputCls + " resize-none"}
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; props.onBlur?.(e); }}
    />
  );
}

// ─── SquadSelect ──────────────────────────────────────────────────────────────

interface SquadSelectProps {
  squads:     string[];
  value:      string;
  onChange:   (v: string) => void;
  onNewSquad: (name: string) => void;
}

function SquadSelect({ squads, value, onChange, onNewSquad }: SquadSelectProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function confirm() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onNewSquad(trimmed);
    onChange(trimmed);
    setNewName("");
    setAdding(false);
  }

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          className={inputCls + " flex-1"}
          style={inputStyle}
          placeholder="Nome da squad..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirm(); } if (e.key === "Escape") setAdding(false); }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; }}
        />
        <button
          type="button"
          onClick={confirm}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-white shrink-0"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="px-3 py-2 rounded-lg text-xs font-medium shrink-0"
          style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onChange={(e) => {
        if (e.target.value === "__new__") { setAdding(true); }
        else { onChange(e.target.value); }
      }}
    >
      <option value="">Selecione...</option>
      {squads.map((s) => <option key={s} value={s}>{s}</option>)}
      <option disabled style={{ color: "var(--color-cinza-mid)" }}>──────────</option>
      <option value="__new__">+ Cadastrar nova squad</option>
    </Select>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  editing:    Colaborador | null;
  squads:     string[];
  onClose:    () => void;
  onSave:     (c: Colaborador) => void;
  onNewSquad: (name: string) => void;
}

function ColaboradorModal({ editing, squads, onClose, onSave, onNewSquad }: ModalProps) {
  const [form, setForm] = useState<Omit<Colaborador, "id">>(
    editing ? { ...editing, endereco: { ...editing.endereco } } : { ...EMPTY_FORM, endereco: { ...EMPTY_ENDERECO } }
  );

  function set<K extends keyof Omit<Colaborador, "id">>(key: K, val: Omit<Colaborador, "id">[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function setEnd<K extends keyof Endereco>(key: K, val: string) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: val } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, id: editing?.id ?? uid() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "var(--color-cinza-mid)" }}
        >
          <h2 className="font-semibold text-base" style={{ color: "var(--color-navy)" }}>
            {editing ? "Editar Colaborador" : "Novo Colaborador"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-6">

            {/* Dados pessoais */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-primary)" }}>
                Dados Pessoais
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Nome completo *">
                    <Input required value={form.nomeCompleto} onChange={(e) => set("nomeCompleto", e.target.value)} placeholder="Ex: João da Silva" />
                  </Field>
                </div>
                <Field label="CPF">
                  <Input value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" />
                </Field>
                <Field label="Telefone">
                  <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" />
                </Field>
              </div>
            </div>

            {/* Dados profissionais */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-primary)" }}>
                Dados Profissionais
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="E-mail corporativo *">
                  <Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nome@dreamsquad.com.br" />
                </Field>
                <Field label="Cargo *">
                  <Input required value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ex: Tech Lead" />
                </Field>
                <Field label="Departamento">
                  <Select value={form.departamento} onChange={(e) => set("departamento", e.target.value)}>
                    <option value="">Selecione...</option>
                    {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </Field>
                <Field label="Squad">
                  <SquadSelect
                    squads={squads}
                    value={form.squad}
                    onChange={(v) => set("squad", v)}
                    onNewSquad={onNewSquad}
                  />
                </Field>
                <Field label="Tipo de contrato">
                  <Select value={form.tipoContrato} onChange={(e) => set("tipoContrato", e.target.value as Contrato)}>
                    {CONTRATOS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Data de admissão">
                  <Input type="date" value={form.dataAdmissao} onChange={(e) => set("dataAdmissao", e.target.value)} />
                </Field>
                <Field label="Salário (R$)">
                  <Input value={form.salario} onChange={(e) => set("salario", e.target.value)} placeholder="Ex: 5000.00" />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(e) => set("status", e.target.value as Status)}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-primary)" }}>
                Endereço
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="CEP">
                  <Input value={form.endereco.cep} onChange={(e) => setEnd("cep", e.target.value)} placeholder="00000-000" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Rua / Avenida">
                    <Input value={form.endereco.rua} onChange={(e) => setEnd("rua", e.target.value)} placeholder="Ex: Rua das Flores" />
                  </Field>
                </div>
                <Field label="Número">
                  <Input value={form.endereco.numero} onChange={(e) => setEnd("numero", e.target.value)} placeholder="123" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Complemento">
                    <Input value={form.endereco.complemento} onChange={(e) => setEnd("complemento", e.target.value)} placeholder="Apto, sala, bloco..." />
                  </Field>
                </div>
                <Field label="Bairro">
                  <Input value={form.endereco.bairro} onChange={(e) => setEnd("bairro", e.target.value)} placeholder="Centro" />
                </Field>
                <Field label="Cidade">
                  <Input value={form.endereco.cidade} onChange={(e) => setEnd("cidade", e.target.value)} placeholder="São Paulo" />
                </Field>
                <Field label="Estado">
                  <Input value={form.endereco.estado} onChange={(e) => setEnd("estado", e.target.value)} placeholder="SP" maxLength={2} />
                </Field>
              </div>
            </div>

            {/* Observações */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-primary)" }}>
                Observações
              </p>
              <Field label="Notas adicionais">
                <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Informações adicionais relevantes..." />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4 border-t shrink-0"
            style={{ borderColor: "var(--color-cinza-mid)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza-mid)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza)"; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
            >
              {editing ? "Salvar alterações" : "Cadastrar colaborador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function ConfirmDelete({ nome, onConfirm, onCancel }: { nome: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4" style={{ backgroundColor: "#fff" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: "#fef2f2" }}>
            🗑️
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Remover colaborador</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Essa ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-mid)" }}>
          Tem certeza que deseja remover <strong>{nome}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-mid)" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-error)" }}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [squads, setSquads]               = useState<string[]>(loadSquads);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState<"Todos" | Status>("Todos");
  const [filterDepto, setFilterDepto]     = useState("Todos");
  const [filterSquad, setFilterSquad]     = useState("Todos");
  const [modalOpen, setModalOpen]         = useState(false);
  const [editing, setEditing]             = useState<Colaborador | null>(null);
  const [deleting, setDeleting]           = useState<Colaborador | null>(null);

  useEffect(() => { saveSquads(squads); }, [squads]);

  function handleNewSquad(name: string) {
    setSquads((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name].sort((a, b) => a.localeCompare(b, "pt-BR"));
    });
  }

  const filtered = colaboradores.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.nomeCompleto.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.cargo.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
    const matchDepto  = filterDepto  === "Todos" || c.departamento === filterDepto;
    const matchSquad  = filterSquad  === "Todos" || c.squad === filterSquad;
    return matchSearch && matchStatus && matchDepto && matchSquad;
  });

  const deptos = ["Todos", ...Array.from(new Set(colaboradores.map((c) => c.departamento).filter(Boolean)))];

  function handleSave(c: Colaborador) {
    setColaboradores((prev) =>
      editing ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c]
    );
    setModalOpen(false);
    setEditing(null);
  }

  function handleEdit(c: Colaborador) {
    setEditing(c);
    setModalOpen(true);
  }

  function handleDelete() {
    if (!deleting) return;
    setColaboradores((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  }

  const statusColor: Record<Status, { bg: string; text: string }> = {
    Ativo:   { bg: "#d1fae5", text: "#065f46" },
    Inativo: { bg: "var(--color-cinza)", text: "var(--color-text-muted)" },
  };

  const contratoColor: Record<Contrato, string> = {
    CLT:       "#eff6ff",
    PJ:        "#f5f3ff",
    Estágio:   "#fff7ed",
    Freelance: "#fdf2f8",
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Gestão de Colaboradores">
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
        >
          <span className="text-base leading-none">+</span>
          Novo colaborador
        </button>
      </Topbar>

      <div className="p-6 space-y-4 max-w-7xl mx-auto w-full">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>🔍</span>
            <input
              className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff" }}
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--color-cinza-mid)"; }}
            />
          </div>

          {/* Status filter */}
          <select
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff", color: "var(--color-text)" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "Todos" | Status)}
          >
            <option value="Todos">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>

          {/* Departamento filter */}
          <select
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff", color: "var(--color-text)" }}
            value={filterDepto}
            onChange={(e) => setFilterDepto(e.target.value)}
          >
            {deptos.map((d) => <option key={d} value={d}>{d === "Todos" ? "Todos os departamentos" : d}</option>)}
          </select>

          {/* Squad filter */}
          <select
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--color-cinza-mid)", backgroundColor: "#fff", color: "var(--color-text)" }}
            value={filterSquad}
            onChange={(e) => setFilterSquad(e.target.value)}
          >
            <option value="Todos">Todas as squads</option>
            <option value="">Sem squad</option>
            {squads.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Count */}
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {filtered.length} colaborador{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Table */}
        {colaboradores.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-20 gap-3"
            style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
          >
            <span className="text-4xl">👥</span>
            <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Nenhum colaborador cadastrado</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Clique em "Novo colaborador" para começar.</p>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              + Novo colaborador
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-16 gap-2"
            style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
          >
            <span className="text-3xl">🔍</span>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Nenhum resultado encontrado.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-cinza-mid)" }}>
            <table className="w-full text-sm" style={{ backgroundColor: "#fff" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-cinza-mid)", backgroundColor: "var(--color-cinza)" }}>
                  {["Colaborador", "Cargo / Departamento", "Contrato", "Admissão", "Salário", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-cinza-mid)" : "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-cinza)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    {/* Colaborador */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}
                        >
                          {c.nomeCompleto.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "var(--color-text)" }}>{c.nomeCompleto}</p>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Cargo / Departamento / Squad */}
                    <td className="px-4 py-3">
                      <p style={{ color: "var(--color-text)" }}>{c.cargo || "—"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {c.departamento && (
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.departamento}</p>
                        )}
                        {c.squad && (
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}
                          >
                            {c.squad}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contrato */}
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: contratoColor[c.tipoContrato], color: "var(--color-text-mid)" }}
                      >
                        {c.tipoContrato}
                      </span>
                    </td>

                    {/* Admissão */}
                    <td className="px-4 py-3" style={{ color: "var(--color-text-mid)" }}>
                      {fmtDate(c.dataAdmissao)}
                    </td>

                    {/* Salário */}
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>
                      {c.salario ? fmtSalario(c.salario.replace(/\D/g, "").padEnd(3, "0")) : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusColor[c.status].bg, color: statusColor[c.status].text }}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 rounded-lg text-sm transition-colors"
                          title="Editar"
                          style={{ color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-cinza-mid)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
                          className="p-1.5 rounded-lg text-sm transition-colors"
                          title="Remover"
                          style={{ color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "var(--color-error)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <ColaboradorModal
          editing={editing}
          squads={squads}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={handleSave}
          onNewSquad={handleNewSquad}
        />
      )}
      {deleting && (
        <ConfirmDelete
          nome={deleting.nomeCompleto}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
