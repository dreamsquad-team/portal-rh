import { useState } from "react";
import { Topbar } from "../components/Topbar";

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  dataInicio: "27 Abr · 2026",
  emailPeople: "rh@dreamsquad.com.br",

  agendas: [
    {
      dia: "Dia 1 · Manhã",
      titulo: "Onboarding Institucional",
      desc: "Boas-vindas ao Conselho e à equipe do Escritório",
    },
    {
      dia: "Dia 1 · Tarde",
      titulo: "Onboarding Liderança",
      desc: "Alinhamento com gestores e líderes de cada área",
    },
    {
      dia: "Data a combinar",
      titulo: "Café com o Board",
      desc: "Bate-papo informal com a alta liderança da DreamSquad",
    },
  ],

  ferramentas: [
    { nome: "Slack", icon: "💬", url: "https://dreamsquad.slack.com", desc: "Comunicação interna" },
    { nome: "JIRA", icon: "🎯", url: "https://dreamsquad.atlassian.net", desc: "Gestão de projetos e tarefas" },
    { nome: "Gather", icon: "🌐", url: "https://gather.town", desc: "Escritório virtual" },
    { nome: "Confluence", icon: "📚", url: "https://dreamsquad.atlassian.net/wiki", desc: "Base de conhecimento" },
    { nome: "Qulture.Rocks", icon: "🎯", url: "https://app.qulture.rocks", desc: "OKRs e cultura" },
    { nome: "AWS Skill Builder", icon: "☁️", url: "https://skillbuilder.aws", desc: "Treinamentos em nuvem" },
    { nome: "Gmail Corporativo", icon: "📧", url: "https://mail.google.com", desc: "E-mail da empresa" },
  ],

  tutoriais: [
    { ferramenta: "Slack", titulo: "Como usar o Slack", duracao: "5 min", url: "#" },
    { ferramenta: "JIRA", titulo: "Primeiros passos no Jira", duracao: "8 min", url: "#" },
    { ferramenta: "Confluence", titulo: "Navegando no Confluence", duracao: "6 min", url: "#" },
    { ferramenta: "Gather", titulo: "Entrando no Gather", duracao: "3 min", url: "#" },
    { ferramenta: "Gmail", titulo: "Configurando o Gmail", duracao: "4 min", url: "#" },
    { ferramenta: "Qulture", titulo: "OKRs no Qulture.Rocks", duracao: "7 min", url: "#" },
    { ferramenta: "AWS", titulo: "Início no Skill Builder", duracao: "5 min", url: "#" },
  ],

  pessoasGrupos: [
    {
      grupo: "🏆 Board",
      pessoas: [
        { nome: "Lucas Palhares", cargo: "CEO · Chief Executive Officer", email: "lucas.palhares@dreamsquad.com.br", foto: "/assets/lucas-palhares.png" },
        { nome: "Luis Palacios", cargo: "CTO · Chief Technology Officer", email: "luis.palacios@dreamsquad.com.br", foto: "/assets/luis-palacios.png" },
        { nome: "Gustavo Biondo", cargo: "CAIO · Chief AI Officer", email: "gustavo.biondo@dreamsquad.com.br", foto: "/assets/gustavo-biondo.png" },
      ],
    },
    {
      grupo: "🏢 Backoffice",
      pessoas: [
        { nome: "Lidiane Lopes", cargo: "Gerente de Recursos Humanos", email: "lidiane.lopes@dreamsquad.com.br", foto: "/assets/lidiane-lopes.png" },
        { nome: "Julia Melo", cargo: "Estagiária de Recursos Humanos", email: "julia.santos@dreamsquad.com.br", foto: "/assets/julia-melo.png" },
        { nome: "Priscilla Werneck", cargo: "Analista Financeiro", email: "priscilla.werneck@dreamsquad.com.br", foto: "/assets/priscilla-werneck.png" },
        { nome: "Rafaela Ferreira", cargo: "Analista de Marketing", email: "rafaela.ferreira@dreamsquad.com.br", foto: "/assets/rafaela-ferreira.png" },
        { nome: "Bruna Matassa", cargo: "Coordenadora de Vendas", email: "bruna.matassa@dreamsquad.com.br", foto: "/assets/bruna-matassa.png" },
      ],
    },
    {
      grupo: "⚙️ Engenharia",
      pessoas: [
        { nome: "Lucas Oshiro", cargo: "Tech Manager", email: "lucas.oshiro@dreamsquad.com.br", foto: "/assets/lucas-oshiro.png" },
        { nome: "Rodolpho Cacioli", cargo: "Project Manager", email: "rodolpho.cacioli@dreamsquad.com.br", foto: "/assets/rodolpho.jpg" },
        { nome: "Enzo Trujillo", cargo: "Tech Lead · Squad Magna", email: "enzo.trujillo@dreamsquad.com.br", foto: "/assets/enzo-trujillo.png" },
        { nome: "Bruno Lopes", cargo: "Tech Lead · Squad Jaú", email: "bruno.lopes@dreamsquad.com.br", foto: "/assets/bruno-lopes.png" },
        { nome: "Bôto", cargo: "Tech Lead · Squad Ômega", email: "mikael.boto@dreamsquad.com.br", foto: "/assets/boto.png" },
        { nome: "Alesson Caldeirão", cargo: "Tech Lead · Squad Apollo", email: "alesson.caldeirao@dreamsquad.com.br", foto: "/assets/alesson-caldeirao.png" },
      ],
    },
    {
      grupo: "🤖 Inteligência Artificial",
      pessoas: [
        { nome: "Pedro Lopes", cargo: "Tech Manager · IA", email: "pedro.lopes@dreamsquad.com.br", foto: "/assets/pedro-lopes.png" },
        { nome: "Igor Rezende", cargo: "Tech Lead · Squad Ares", email: "igor.rezende@dreamsquad.com.br", foto: "/assets/igor-rezende.png" },
        { nome: "Diego Pereira", cargo: "Tech Lead · Squad Athena", email: "diego.pereira@dreamsquad.com.br", foto: "/assets/diego-pereira.png" },
      ],
    },
  ],

  slackCanais: [
    { nome: "#dreamboost", desc: "Canal de motivação e conquistas da equipe" },
    { nome: "#dreamqulture", desc: "Cultura, valores e iniciativas de RH" },
    { nome: "#geral", desc: "Comunicados e informações gerais" },
    { nome: "#news", desc: "Novidades e atualizações do mercado" },
    { nome: "#outros-assuntos", desc: "Para conversas informais e off-topics" },
  ],

  linkedin: {
    titulo: "Compartilhe seu novo começo!",
    desc: "Que tal celebrar essa nova jornada com suas conexões no LinkedIn? Use a moldura DreamSquad e marque a empresa na sua publicação.",
    hashtag: "#onboardingdream",
    obs: "Moldura disponível nos Materiais abaixo",
  },

  pesquisas: [
    { dias: "7 dias", titulo: "Primeiros Passos", desc: "Como foi sua primeira semana?", url: "#" },
    { dias: "30 dias", titulo: "Adaptação", desc: "Como está sendo o primeiro mês?", url: "#" },
    { dias: "45 dias", titulo: "Integração", desc: "Você já se sente parte do time?", url: "#" },
  ],

  materiais: [
    { titulo: "Capa do LinkedIn", desc: "Moldura DreamSquad para o LinkedIn", url: "#", icon: "🖼️" },
    { titulo: "Fundo para Videochamadas", desc: "Background DreamSquad para chamadas", url: "#", icon: "🎥" },
    { titulo: "Assinatura de E-mail", desc: "Template de assinatura corporativa", url: "#", icon: "✉️" },
  ],

  avisos: [
    { titulo: "Glassdoor – Processo Seletivo", desc: "Pedimos que avalie seu processo seletivo no Glassdoor.", icon: "⭐" },
    { titulo: "Glassdoor – Avaliação da Empresa", desc: "Compartilhe sua opinião sobre a DreamSquad no Glassdoor.", icon: "🏢" },
    { titulo: "Acessos serão testados", desc: "Em breve faremos uma rodada de testes para garantir que todos os acessos estejam funcionando.", icon: "🔑" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="text-xs font-bold px-2 py-1 rounded-md"
        style={{ backgroundColor: "var(--color-primary)", color: "#fff", letterSpacing: "0.05em" }}
      >
        {num}
      </span>
      <h2 className="text-base font-semibold" style={{ color: "var(--color-navy)" }}>
        {title}
      </h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ backgroundColor: "var(--color-surface)" }}>
      <Topbar title="Onboarding" />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-10 pb-16">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-mid) 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Left: welcome text */}
            <div className="flex-1 p-8 flex flex-col justify-center gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-primary-light)" }}>
                  Portal RH · DreamSquad
                </p>
                <h1 className="text-2xl font-bold text-white leading-snug">
                  Bem-vindo(a) à<br />
                  <span style={{ color: "var(--color-primary-ui)" }}>DreamSquad!</span>
                </h1>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                Aqui você encontra tudo que precisa para os seus primeiros dias: agenda, acessos, pessoas-chave, materiais e muito mais.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="px-4 py-2 rounded-xl text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Dúvidas?</p>
                  <p className="text-sm font-bold" style={{ color: "var(--color-primary-ui)" }}>{CONFIG.emailPeople}</p>
                </div>
              </div>
            </div>

            {/* Right: kit mosaic */}
            <div className="md:w-72 p-4 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-xs">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <img
                    key={n}
                    src={`/assets/kit${n}.png`}
                    alt={`Kit ${n}`}
                    className="rounded-lg object-cover aspect-square w-full"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 01 · Agenda ───────────────────────────────────────────────── */}
        <div>
          <SectionLabel num="01" title="Agenda dos Primeiros Dias" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONFIG.agendas.map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-2"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                }}
              >
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full self-start"
                  style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}
                >
                  {item.dia}
                </span>
                <p className="font-semibold text-sm leading-snug" style={{ color: "var(--color-text)" }}>
                  {item.titulo}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 02 · Acessos ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel num="02" title="Ferramentas & Acessos" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONFIG.ferramentas.map((tool, i) => (
              <a
                key={i}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span className="text-2xl">{tool.icon}</span>
                <p className="font-semibold text-sm leading-tight" style={{ color: "var(--color-text)" }}>
                  {tool.nome}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {tool.desc}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* ── 03 · Tutoriais ────────────────────────────────────────────── */}
        <div>
          <SectionLabel num="03" title="Tutoriais de Onboarding" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONFIG.tutoriais.map((tut, i) => (
              <a
                key={i}
                href={tut.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 font-bold"
                  style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}
                >
                  ▶
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {tut.titulo}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {tut.ferramenta} · {tut.duracao}
                  </p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--color-cinza)", color: "var(--color-text-muted)" }}
                >
                  {tut.duracao}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── 04 · Pessoas-chave ────────────────────────────────────────── */}
        <div>
          <SectionLabel num="04" title="Pessoas-chave" />

          {/* Group tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {CONFIG.pessoasGrupos.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveGroup(i)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeGroup === i ? "var(--color-primary)" : "#fff",
                  color: activeGroup === i ? "#fff" : "var(--color-text-mid)",
                  border: `1px solid ${activeGroup === i ? "var(--color-primary)" : "var(--color-cinza-mid)"}`,
                }}
              >
                {g.grupo}
              </button>
            ))}
          </div>

          {/* People cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CONFIG.pessoasGrupos[activeGroup].pessoas.map((pessoa, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                }}
              >
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: "var(--color-cinza)" }}>
                  <img
                    src={pessoa.foto}
                    alt={pessoa.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <p className="font-semibold text-sm leading-tight" style={{ color: "var(--color-text)" }}>
                    {pessoa.nome}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-primary)" }}>
                    {pessoa.cargo}
                  </p>
                  <a
                    href={`mailto:${pessoa.email}`}
                    className="text-xs truncate hover:underline"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {pessoa.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 05 · Comunicação ──────────────────────────────────────────── */}
        <div>
          <SectionLabel num="05" title="Comunicação" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Slack */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💬</span>
                <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                  Canais do Slack
                </p>
              </div>
              <div className="space-y-2">
                {CONFIG.slackCanais.map((canal, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5"
                      style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}
                    >
                      {canal.nome}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {canal.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* LinkedIn */}
            <div
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: "linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-mid) 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🔗</span>
                <p className="font-semibold text-sm text-white">{CONFIG.linkedin.titulo}</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {CONFIG.linkedin.desc}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-md"
                  style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
                >
                  {CONFIG.linkedin.hashtag}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {CONFIG.linkedin.obs}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 06 · Pesquisas ────────────────────────────────────────────── */}
        <div>
          <SectionLabel num="06" title="Pesquisas de Integração" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONFIG.pesquisas.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex flex-col gap-3"
                style={{ backgroundColor: "#fff", border: "1px solid var(--color-cinza-mid)" }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
                  style={{ backgroundColor: "#fff0f5", color: "var(--color-primary)" }}
                >
                  {p.dias}
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {p.titulo}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {p.desc}
                  </p>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-center transition-all mt-auto"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary-dark)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
                >
                  Responder pesquisa →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── 07 · Materiais ────────────────────────────────────────────── */}
        <div>
          <SectionLabel num="07" title="Materiais de Marca" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONFIG.materiais.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-xl p-5 transition-all"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(174,39,92,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-cinza-mid)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: "#fff0f5" }}
                >
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {m.titulo}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {m.desc}
                  </p>
                  <p className="text-xs font-medium mt-2" style={{ color: "var(--color-primary)" }}>
                    Acessar →
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── 08 · Avisos Finais ────────────────────────────────────────── */}
        <div>
          <SectionLabel num="08" title="Avisos Finais" />
          <div className="space-y-3">
            {CONFIG.avisos.map((aviso, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl p-4"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-cinza-mid)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: "var(--color-cinza)" }}
                >
                  {aviso.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {aviso.titulo}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {aviso.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
