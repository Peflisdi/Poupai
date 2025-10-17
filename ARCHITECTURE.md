# 🏗️ ARQUITETURA E COMPONENTES CRIADOS

## ✅ Estrutura Criada

### Configuração Base

```
✅ package.json              - Dependências e scripts
✅ tsconfig.json             - Configuração TypeScript
✅ tailwind.config.ts        - Tema monocromático completo
✅ postcss.config.mjs        - PostCSS + Autoprefixer
✅ next.config.mjs           - Configuração Next.js
✅ .env.example              - Template de variáveis de ambiente
✅ .gitignore                - Arquivos ignorados pelo Git
✅ .eslintrc.json            - Configuração ESLint
```

### Banco de Dados (Prisma)

```
✅ prisma/schema.prisma      - Schema completo com todos os modelos
   - User (usuários)
   - Account (OAuth accounts)
   - Session (sessões)
   - VerificationToken
   - Category (categorias de transações)
   - Transaction (receitas e despesas)
   - Card (cartões de crédito)
   - InstallmentPurchase (compras parceladas)
   - Goal (objetivos/cofrinhos)
   - GoalDeposit (depósitos em objetivos)
```

### Autenticação

```
✅ src/lib/auth.ts                        - Configuração NextAuth
✅ src/app/api/auth/[...nextauth]/route.ts - Handler NextAuth
✅ src/app/api/auth/register/route.ts     - API de registro
✅ src/app/auth/login/page.tsx            - Página de login
✅ src/app/auth/register/page.tsx         - Página de registro
```

### Layout e Providers

```
✅ src/app/layout.tsx                     - Layout raiz
✅ src/app/page.tsx                       - Redirect para dashboard
✅ src/app/globals.css                    - Estilos globais + CSS vars
✅ src/components/providers/Providers.tsx - Wrapper de providers
✅ src/components/providers/ThemeProvider.tsx - Provider de tema light/dark
```

### Componentes UI Base

```
✅ src/components/ui/Button.tsx   - Botão (4 variantes, 3 tamanhos, loading)
✅ src/components/ui/Input.tsx    - Input (label, erro, helper text)
✅ src/components/ui/Card.tsx     - Card + Header + Title + Description + Content
```

### Utilitários

```
✅ src/lib/utils.ts   - Funções auxiliares
   - cn() - Merge de classes Tailwind
   - formatCurrency() - Formatar moeda
   - formatDate() - Formatar data
   - formatPercentage() - Formatar porcentagem
   - getInitials() - Obter iniciais do nome

✅ src/lib/db.ts      - Cliente Prisma singleton
```

### Documentação

```
✅ README.md          - Documentação principal do projeto
✅ INSTALLATION.md    - Guia passo a passo de instalação
✅ DEVELOPMENT.md     - Roadmap detalhado de desenvolvimento
✅ ARCHITECTURE.md    - Este arquivo
```

---

## 🚧 Próximos Componentes a Criar

### Componentes UI Adicionais Necessários

#### 1. Select (Dropdown)

```typescript
// src/components/ui/Select.tsx
- Single select
- Multi select
- Search dentro do select
- Grupos de opções
- Customização de ícones
```

#### 2. Modal (Dialog)

```typescript
// src/components/ui/Modal.tsx
- Overlay escuro
- Animações de entrada/saída
- Botão de fechar
- Tamanhos (sm, md, lg, full)
- Footer com ações
```

#### 3. Toast (Notificações)

```typescript
// src/components/ui/Toast.tsx
- Provider de toasts
- Tipos: success, error, warning, info
- Posição configurável
- Auto-dismiss
- Ações inline
```

#### 4. DatePicker

```typescript
// src/components/ui/DatePicker.tsx
- Calendário visual
- Range de datas
- Presets (hoje, semana, mês)
- Integração com Input
```

#### 5. Skeleton (Loading)

```typescript
// src/components/ui/Skeleton.tsx
- Skeleton para texto
- Skeleton para cards
- Skeleton para listas
- Animação shimmer
```

#### 6. Badge

```typescript
// src/components/ui/Badge.tsx
- Variantes de cor
- Tamanhos
- Com ícone
- Outline vs filled
```

#### 7. Tabs

```typescript
// src/components/ui/Tabs.tsx
- Navegação por abas
- Conteúdo lazy loading
- Underline indicator
- Vertical tabs
```

#### 8. Dropdown Menu

```typescript
// src/components/ui/DropdownMenu.tsx
- Menu contextual
- Submenus
- Separadores
- Ícones
- Atalhos de teclado
```

#### 9. Checkbox & Radio

```typescript
// src/components/ui/Checkbox.tsx
// src/components/ui/Radio.tsx
- Estados (checked, indeterminate)
- Labels
- Grupos
- Disabled state
```

#### 10. Switch (Toggle)

```typescript
// src/components/ui/Switch.tsx
- On/Off toggle
- Label
- Disabled state
- Animações suaves
```

---

## 📁 Estrutura de Pastas Completa (Próxima)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx ✅
│   │   └── register/
│   │       └── page.tsx ✅
│   ├── (dashboard)/
│   │   ├── layout.tsx 🚧 CRIAR
│   │   ├── dashboard/
│   │   │   └── page.tsx 🚧 CRIAR
│   │   ├── transactions/
│   │   │   ├── page.tsx 🚧 CRIAR
│   │   │   └── [id]/
│   │   │       └── page.tsx 🚧 CRIAR (editar)
│   │   ├── cards/
│   │   │   ├── page.tsx 🚧 CRIAR
│   │   │   └── [id]/
│   │   │       └── page.tsx 🚧 CRIAR (detalhes)
│   │   ├── goals/
│   │   │   ├── page.tsx 🚧 CRIAR
│   │   │   └── [id]/
│   │   │       └── page.tsx 🚧 CRIAR (detalhes)
│   │   ├── categories/
│   │   │   └── page.tsx 🚧 CRIAR
│   │   ├── reports/
│   │   │   └── page.tsx 🚧 CRIAR
│   │   └── settings/
│   │       └── page.tsx 🚧 CRIAR
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts ✅
│   │   │   └── register/
│   │   │       └── route.ts ✅
│   │   ├── transactions/
│   │   │   ├── route.ts 🚧 CRIAR (GET, POST)
│   │   │   └── [id]/
│   │   │       └── route.ts 🚧 CRIAR (GET, PUT, DELETE)
│   │   ├── categories/
│   │   │   ├── route.ts 🚧 CRIAR
│   │   │   └── [id]/
│   │   │       └── route.ts 🚧 CRIAR
│   │   ├── cards/
│   │   │   ├── route.ts 🚧 CRIAR
│   │   │   └── [id]/
│   │   │       └── route.ts 🚧 CRIAR
│   │   └── goals/
│   │       ├── route.ts 🚧 CRIAR
│   │       └── [id]/
│   │           └── route.ts 🚧 CRIAR
│   ├── layout.tsx ✅
│   ├── page.tsx ✅
│   └── globals.css ✅
├── components/
│   ├── ui/
│   │   ├── Button.tsx ✅
│   │   ├── Input.tsx ✅
│   │   ├── Card.tsx ✅
│   │   ├── Select.tsx 🚧 CRIAR
│   │   ├── Modal.tsx 🚧 CRIAR
│   │   ├── Toast.tsx 🚧 CRIAR
│   │   ├── DatePicker.tsx 🚧 CRIAR
│   │   ├── Skeleton.tsx 🚧 CRIAR
│   │   ├── Badge.tsx 🚧 CRIAR
│   │   ├── Tabs.tsx 🚧 CRIAR
│   │   ├── DropdownMenu.tsx 🚧 CRIAR
│   │   ├── Checkbox.tsx 🚧 CRIAR
│   │   ├── Radio.tsx 🚧 CRIAR
│   │   └── Switch.tsx 🚧 CRIAR
│   ├── layout/
│   │   ├── Sidebar.tsx 🚧 CRIAR
│   │   ├── Header.tsx 🚧 CRIAR
│   │   ├── UserMenu.tsx 🚧 CRIAR
│   │   └── ThemeToggle.tsx 🚧 CRIAR
│   ├── dashboard/
│   │   ├── SummaryCards.tsx 🚧 CRIAR
│   │   ├── CategoryChart.tsx 🚧 CRIAR
│   │   ├── TimelineChart.tsx 🚧 CRIAR
│   │   ├── RecentTransactions.tsx 🚧 CRIAR
│   │   └── AlertsSection.tsx 🚧 CRIAR
│   ├── transactions/
│   │   ├── TransactionList.tsx 🚧 CRIAR
│   │   ├── TransactionItem.tsx 🚧 CRIAR
│   │   ├── TransactionFilters.tsx 🚧 CRIAR
│   │   ├── TransactionModal.tsx 🚧 CRIAR
│   │   └── TransactionForm.tsx 🚧 CRIAR
│   ├── categories/
│   │   ├── CategoryList.tsx 🚧 CRIAR
│   │   ├── CategoryItem.tsx 🚧 CRIAR
│   │   ├── CategoryModal.tsx 🚧 CRIAR
│   │   ├── CategoryForm.tsx 🚧 CRIAR
│   │   └── IconPicker.tsx 🚧 CRIAR
│   ├── cards/
│   │   ├── CardList.tsx 🚧 CRIAR
│   │   ├── CardItem.tsx 🚧 CRIAR
│   │   ├── CardModal.tsx 🚧 CRIAR
│   │   ├── CardForm.tsx 🚧 CRIAR
│   │   └── InvoiceView.tsx 🚧 CRIAR
│   ├── goals/
│   │   ├── GoalList.tsx 🚧 CRIAR
│   │   ├── GoalItem.tsx 🚧 CRIAR
│   │   ├── GoalModal.tsx 🚧 CRIAR
│   │   ├── GoalForm.tsx 🚧 CRIAR
│   │   └── DepositModal.tsx 🚧 CRIAR
│   └── providers/
│       ├── Providers.tsx ✅
│       └── ThemeProvider.tsx ✅
├── lib/
│   ├── db.ts ✅
│   ├── auth.ts ✅
│   ├── utils.ts ✅
│   ├── validations.ts 🚧 CRIAR (Zod schemas)
│   └── hooks/
│       ├── useTransactions.ts 🚧 CRIAR
│       ├── useCategories.ts 🚧 CRIAR
│       ├── useCards.ts 🚧 CRIAR
│       └── useGoals.ts 🚧 CRIAR
└── types/
    └── index.ts 🚧 CRIAR (tipos TypeScript globais)
```

---

## 🎨 Sistema de Design

### Cores Implementadas

```css
Light Mode:
✅ Background: #FFFFFF, #F5F5F5, #ECECEC
✅ Text: #000000, #666666, #999999
✅ Borders: #E0E0E0, #F0F0F0
✅ Accent: #000000

Dark Mode:
✅ Background: #000000, #0A0A0A, #1A1A1A
✅ Text: #FFFFFF, #A0A0A0, #707070
✅ Borders: #2A2A2A, #1A1A1A
✅ Accent: #FFFFFF

Alertas:
✅ Error: #DC2626 / #EF4444
✅ Warning: #F59E0B / #FBBF24
✅ Success: #10B981 / #34D399
✅ Info: #3B82F6 / #60A5FA
```

### Tipografia Implementada

```css
✅ Font: Inter (via next/font/google)
✅ H1: 36px, Weight 700
✅ H2: 28px, Weight 600
✅ H3: 20px, Weight 600
✅ Body: 16px, Weight 400
✅ Small: 14px, Weight 400
✅ Micro: 12px, Weight 400
✅ Currency: 28px, Weight 700, Mono
```

### Espaçamento e Layout

```css
✅ Border Radius: 8px (cards), 6px (buttons)
✅ Transitions: 150ms (smooth)
✅ Animations: fadeIn, slideIn
✅ Shadows: Nenhuma (apenas bordas)
```

---

## 🔐 Autenticação Implementada

### NextAuth.js

```typescript
✅ Providers:
   - Credentials (email/password)
   - Google OAuth

✅ Session Strategy: JWT

✅ Callbacks:
   - jwt: adiciona user.id ao token
   - session: adiciona user.id à session

✅ Pages:
   - signIn: /auth/login
   - error: /auth/error
```

### API Routes

```typescript
✅ POST /api/auth/register
   - Valida dados com Zod
   - Hash de senha com bcryptjs
   - Cria usuário
   - Cria categorias padrão
   - Retorna sucesso/erro

✅ [...nextauth]/route.ts
   - Handler padrão do NextAuth
```

---

## 📊 Banco de Dados

### Modelos Criados

```prisma
✅ User - Usuário
   - id, name, email, password, image
   - currency, firstDayOfMonth
   - Relations: accounts, sessions, transactions, categories, cards, goals

✅ Account - OAuth accounts
   - Para login com Google

✅ Session - Sessões do usuário

✅ VerificationToken - Tokens de verificação

✅ Category - Categorias
   - name, icon, color, budget
   - isDefault (categorias pré-definidas)
   - parentId (subcategorias)

✅ Transaction - Transações
   - type (EXPENSE, INCOME, TRANSFER)
   - amount, description, date
   - paymentMethod (CASH, DEBIT, CREDIT, PIX)
   - isRecurring
   - tags[]
   - Relations: user, category, card, installmentPurchase

✅ Card - Cartões de crédito
   - name, nickname, limit
   - closingDay, dueDay, color

✅ InstallmentPurchase - Compras parceladas
   - description, totalAmount
   - installments, installmentAmount
   - startDate

✅ Goal - Objetivos/Cofrinhos
   - name, targetAmount, currentAmount
   - deadline, icon, color
   - Relations: deposits

✅ GoalDeposit - Depósitos em objetivos
   - amount, note, createdAt
```

---

## 🛣️ Rotas

### Públicas

```
✅ GET  /auth/login       - Página de login
✅ GET  /auth/register    - Página de registro
✅ POST /api/auth/register - API de registro
```

### Protegidas (a criar)

```
🚧 Dashboard
   GET /dashboard

🚧 Transações
   GET    /transactions
   GET    /transactions/[id]
   POST   /api/transactions
   PUT    /api/transactions/[id]
   DELETE /api/transactions/[id]

🚧 Categorias
   GET    /categories
   POST   /api/categories
   PUT    /api/categories/[id]
   DELETE /api/categories/[id]

🚧 Cartões
   GET    /cards
   GET    /cards/[id]
   POST   /api/cards
   PUT    /api/cards/[id]
   DELETE /api/cards/[id]

🚧 Objetivos
   GET    /goals
   GET    /goals/[id]
   POST   /api/goals
   PUT    /api/goals/[id]
   DELETE /api/goals/[id]
   POST   /api/goals/[id]/deposit

🚧 Relatórios
   GET /reports

🚧 Configurações
   GET /settings
```

---

## 🧪 Testes (a implementar)

```
🚧 Unit Tests
   - Componentes UI
   - Funções utilitárias
   - Validações Zod

🚧 Integration Tests
   - API Routes
   - Fluxos de autenticação
   - CRUD operations

🚧 E2E Tests
   - Fluxo de registro
   - Fluxo de login
   - Criar transação
   - Criar categoria
```

---

## 📦 Build e Deploy

### Comandos

```bash
✅ npm run dev     - Desenvolvimento
✅ npm run build   - Build de produção
✅ npm run start   - Servidor de produção
✅ npm run lint    - Linter
```

### Deploy Vercel (recomendado)

```
1. Push para GitHub
2. Conectar repositório no Vercel
3. Configurar variáveis de ambiente
4. Deploy automático
```

---

## 🎯 Próximos Passos Imediatos

1. **Criar Sidebar** (layout/Sidebar.tsx)
2. **Criar Header** (layout/Header.tsx)
3. **Criar Layout do Dashboard** ((dashboard)/layout.tsx)
4. **Criar Dashboard Page** com resumo financeiro
5. **Implementar APIs de Transações**
6. **Criar páginas e modals de Transações**
7. **Continuar desenvolvimento conforme DEVELOPMENT.md**

---

**Status Atual**: MVP Base Completo (autenticação + estrutura + componentes base)
**Próxima Fase**: Dashboard e Transações
