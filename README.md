# Portal RH

Dashboard web para o time de RH acompanhar as solicitações de férias do Jira integrado com dados de admissão do Google Sheets.

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- Token de API do Jira
- Conta de serviço do Google (JSON)

## Configuração

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `JIRA_EMAIL` | Seu e-mail no Atlassian |
| `JIRA_API_TOKEN` | Token gerado em https://id.atlassian.com/manage-profile/security/api-tokens |
| `GOOGLE_SHEETS_ID` | ID da planilha (na URL: `/spreadsheets/d/<ID>/`) |
| `GOOGLE_CREDENTIALS_FILE` | Caminho para o JSON da conta de serviço |

Coloque o arquivo `google-credentials.json` da conta de serviço dentro de `backend/`.

### 2. Google Sheets — Estrutura esperada

A primeira aba deve ter as colunas (nomes aceitos em PT ou EN):

| Coluna | Nomes aceitos |
|---|---|
| E-mail | `email`, `Email`, `e-mail` |
| Nome | `nome`, `Nome`, `name` |
| Data de admissão | `data_admissao`, `data admissão`, `Data de Admissão` |
| Departamento | `departamento`, `Departamento`, `area` |
| Cargo | `cargo`, `Cargo`, `position` |

Conceda acesso de **Leitor** ao e-mail da conta de serviço na planilha.

### 3. Frontend

```bash
cd frontend
npm install
```

## Rodando

Em dois terminais separados:

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload
# Roda em http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Roda em http://localhost:5173
```

## Funcionalidades

- Lista todos os funcionários com dados do Jira + Google Sheets
- Indicador visual se completou 1 ano de empresa
- Data prevista do aniversário de 1 ano para quem ainda não completou
- Saldo de férias com cor (verde / laranja / vermelho)
- Status da última solicitação no Jira
- Filtros: todos / solicitação aberta / sem pedido / menos de 1 ano
- Busca por nome, e-mail ou departamento
- Drawer lateral com histórico completo de solicitações por funcionário
- Link direto para cada issue no Jira
