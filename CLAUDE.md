# Prosperar — Guia do Projeto

## Stack

### Backend
- Laravel 13 (PHP 8.3) + Lighthouse GraphQL (`nuwave/lighthouse ^6.66`)
- MySQL 8 + Laravel Sanctum (autenticação por token Bearer)
- `smalot/pdfparser` (extração de texto) + `setasign/fpdi` + `setasign/fpdf` (split de páginas)
- Docker: `php:8.3-fpm` + nginx

### Frontend
- React 19 + Vite + TypeScript
- **shadcn/ui** para todos os componentes de UI (Button, Input, Label, Select, Dialog, Card, Table, Badge, etc.)
- Tailwind CSS v4 com `@theme inline` e variáveis CSS
- Apollo Client v4 — imports de `@apollo/client/react` (hooks) e `@apollo/client/core` (gql, etc.)
- `apollo-upload-client` para upload de arquivos via GraphQL multipart
- `lucide-react` para ícones
- Docker: build estático servido por nginx

## Estrutura de Pastas (Frontend)

```
src/
├── components/
│   ├── ui/          # componentes shadcn/ui
│   ├── layout/      # AppLayout
│   └── shared/      # DataTable, Pagination, SearchBar, StatusBadge, DownloadButton
├── pages/
│   ├── auth/        # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── client/      # ExamListPage, ProfilePage
│   ├── admin/       # ExamListPage, UploadExamPage, ClientsPage, HospitalsPage
│   └── hospital/    # ExamListPage, ClientListPage
├── hooks/           # useExamList, useDownload, useAuth
├── context/         # AuthContext
├── graphql/
│   ├── queries/
│   └── mutations/
└── lib/             # apollo.ts, utils.ts (cn)
```

## Convenções de Código

- **Código em inglês**: nomes de variáveis, funções, tipos, comentários
- **Labels/textos da UI em português (pt-BR)**: tudo que o usuário vê na tela
- Componentes funcionais com `function` (não arrow functions no nível do módulo)
- Sem `any` explícito sempre que possível; usar `any` apenas em queries Apollo onde necessário

## Padrões de UI (shadcn/ui + Glazey Design System)

### Tema Visual (Glazey)
- **Primary (coral):** `#E8624A` — botões, active indicators, foco
- **Background:** `#F5F6FA` — fundo da página
- **Card:** `#FFFFFF` — cards com `rounded-2xl` e shadow `0 2px 8px rgba(46,58,89,0.06)` (sem border)
- **Texto principal:** `#2E3A59` — navy
- **Texto secundário / ícones inativos:** `#7C8DB5` — slate
- **Border:** `#E8ECF4`
- **Fonte:** Poppins (Google Fonts, pesos 400/500/600/700/800)
- **Sidebar:** branca; item ativo = 3px left bar coral + texto coral + bg `#FFF5F3`; inativo = texto `#7C8DB5`
- **Status badges:** teal `#4ECDC4` bg `#E6F9F7` (disponível/entregue), orange `#F5A623` bg `#FEF5E6` (pendente), coral `#E8624A` bg `#FDEAE6` (erro)

### Componentes
- Sempre usar shadcn/ui — nunca `<select>` nativo, `<button>` nativo, `<input>` nativo
- Modais: `Dialog` + `DialogContent` + `DialogHeader` + `DialogFooter`
- Formulários: `Label` + `Input` (ou `Textarea`, `Select`) com `space-y-1.5` entre label e input
- Badges de status: `StatusBadge` (componente compartilhado com cores por status)
- **Radix Select não aceita `value=""`** — usar constante sentinela `'__all__'` para "todos"

### Datas
- Sempre exibir no formato brasileiro: `DD/MM/AAAA` (sem horas/segundos)
- Usar `toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })`
- Ao passar para a API: formato `YYYY-MM-DD`

### Listagens (DataTable)
- Colunas padrão de exames: **ID | Nome | CPF | Hospital | Data | Status | Ações**
- Botão de download sempre visível para todos os grupos de acesso
- Paginação com shadcn Select para "registros por página"
- Busca com debounce de 300ms (`SearchBar`)

## Autenticação

- Token armazenado em `localStorage` como `token`
- Usuário armazenado em `localStorage` como `user` (JSON)
- `useAuth()` via `AuthContext`
- Grupos: `client`, `admin`, `hospital`

## Download de Arquivos

- Rota: `GET /api/exams/{id}/download` (em `routes/api.php`, não `web.php`)
- Autenticado via Bearer token
- Hook `useDownload` — fetch com header `Authorization`, cria blob URL, dispara click
- URL base: `VITE_API_URL` (padrão `http://localhost:8000`)

## Backend — Regras Importantes

- Rota de download em `routes/api.php` (stateless, sem sessão) — nunca em `web.php`
- CORS em `config/cors.php`: incluir `graphql`, `api/*`, `sanctum/csrf-cookie`
- Lighthouse: `'guards' => ['sanctum']` em `config/lighthouse.php`
- Cache do Lighthouse desabilitado em dev: `LIGHTHOUSE_QUERY_CACHE_ENABLE=false`
- `@paginate` com `builder:` (não `resolver:`) para queries que retornam Eloquent Builder
- PDF: extrair ID do paciente com regex `/ID:\s*(\S+)/i` do texto da página

## Papéis e Permissões

| Ação                        | Client | Admin | Hospital |
|-----------------------------|--------|-------|----------|
| Ver próprios exames         | ✅     | ✅    | ❌       |
| Ver todos os exames         | ❌     | ✅    | ❌       |
| Ver exames do hospital      | ❌     | ❌    | ✅       |
| Upload de exames            | ❌     | ✅    | ❌       |
| Gerenciar pacientes         | ❌     | ✅    | ✅ (ver) |
| Gerenciar hospitais         | ❌     | ✅    | ❌       |
| Baixar PDF                  | ✅     | ✅    | ✅       |

## Docker

```yaml
# serviços
app       # Laravel php-fpm
nginx     # proxy para o app
frontend  # React build estático servido por nginx (porta 3000)
db        # MySQL 8
```

- Rebuild frontend: `docker compose build frontend && docker compose up -d frontend`
- Restart backend: `docker compose up -d app`
- Logs: `docker compose logs -f app`
