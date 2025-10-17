# 📝 TODO LIST - Próximos Componentes a Criar

## 🎯 PRIORIDADE 1 - Layout Base

### Sidebar (Menu Lateral)

```tsx
// src/components/layout/Sidebar.tsx
- [ ] Logo/Nome do app
- [ ] Menu items com ícones:
  - [ ] Dashboard
  - [ ] Transações
  - [ ] Cartões
  - [ ] Objetivos
  - [ ] Categorias
  - [ ] Relatórios
  - [ ] Configurações
- [ ] Toggle de tema (light/dark)
- [ ] User menu na parte inferior
- [ ] Botão de collapse sidebar
- [ ] Indicador de página ativa
- [ ] Responsivo (drawer no mobile)
```

### Header

```tsx
// src/components/layout/Header.tsx
- [ ] Breadcrumbs
- [ ] Search bar (busca global)
- [ ] Notifications icon
- [ ] User avatar + dropdown
- [ ] Mobile: botão de abrir sidebar
```

### Theme Toggle

```tsx
// src/components/layout/ThemeToggle.tsx
- [ ] Botão de toggle sun/moon
- [ ] Transição suave
- [ ] Integrar com ThemeProvider
```

---

## 🎯 PRIORIDADE 2 - Dashboard

### Summary Cards

```tsx
// src/components/dashboard/SummaryCards.tsx
- [ ] Card de saldo atual
- [ ] Card de gastos do mês
- [ ] Card de receitas do mês
- [ ] Card de percentual do orçamento
- [ ] Valores formatados em moeda
- [ ] Ícones representativos
- [ ] Loading skeletons
```

### Category Chart

```tsx
// src/components/dashboard/CategoryChart.tsx
- [ ] Gráfico de pizza (Recharts)
- [ ] Distribuição por categoria
- [ ] Cores monocromáticas
- [ ] Tooltip com detalhes
- [ ] Legend
- [ ] Responsive
```

### Timeline Chart

```tsx
// src/components/dashboard/TimelineChart.tsx
- [ ] Gráfico de linha (gastos ao longo do tempo)
- [ ] Seletor de período (7/30/90 dias)
- [ ] Tooltips informativos
- [ ] Grid discreto
- [ ] Animações suaves
```

### Recent Transactions

```tsx
// src/components/dashboard/RecentTransactions.tsx
- [ ] Lista das últimas 5-10 transações
- [ ] Item com: valor, categoria, data
- [ ] Link para ver todas
- [ ] Empty state se não houver
```

### Alerts Section

```tsx
// src/components/dashboard/AlertsSection.tsx
- [ ] Alertas de vencimento
- [ ] Alertas de limite de cartão
- [ ] Alertas de meta de categoria
- [ ] Badges de severidade
- [ ] Dismissable
```

---

## 🎯 PRIORIDADE 3 - Transações

### API Routes

```tsx
// src/app/api/transactions/route.ts
- [ ] GET - Listar transações com filtros
- [ ] POST - Criar transação
// src/app/api/transactions/[id]/route.ts
- [ ] GET - Buscar transação por ID
- [ ] PUT - Atualizar transação
- [ ] DELETE - Deletar transação
```

### Transaction List

```tsx
// src/components/transactions/TransactionList.tsx
- [ ] Lista paginada de transações
- [ ] Agrupamento por data
- [ ] Infinite scroll ou paginação
- [ ] Empty state
- [ ] Loading state
```

### Transaction Item

```tsx
// src/components/transactions/TransactionItem.tsx
- [ ] Visualização compacta de transação
- [ ] Ícone da categoria
- [ ] Valor com cor (verde receita, vermelho despesa)
- [ ] Data formatada
- [ ] Badge de forma de pagamento
- [ ] Hover actions (edit, delete)
```

### Transaction Filters

```tsx
// src/components/transactions/TransactionFilters.tsx
- [ ] Filtro por período
- [ ] Filtro por categoria
- [ ] Filtro por tipo (receita/despesa)
- [ ] Filtro por forma de pagamento
- [ ] Busca por descrição
- [ ] Botão de limpar filtros
```

### Transaction Modal

```tsx
// src/components/transactions/TransactionModal.tsx
- [ ] Modal de criar/editar
- [ ] Form integration
- [ ] Validação
- [ ] Submit handlers
- [ ] Close handlers
```

### Transaction Form

```tsx
// src/components/transactions/TransactionForm.tsx
- [ ] React Hook Form
- [ ] Campos:
  - [ ] Tipo (receita/despesa)
  - [ ] Valor (com máscara de moeda)
  - [ ] Categoria (select)
  - [ ] Data (datepicker)
  - [ ] Descrição
  - [ ] Forma de pagamento
  - [ ] Tags (multi input)
  - [ ] Anexo (file upload)
  - [ ] Recorrente (checkbox)
- [ ] Validação com Zod
- [ ] Estados de loading/error
```

---

## 🎯 PRIORIDADE 4 - Categorias

### API Routes

```tsx
// src/app/api/categories/route.ts
- [ ] GET - Listar categorias
- [ ] POST - Criar categoria
// src/app/api/categories/[id]/route.ts
- [ ] PUT - Atualizar categoria
- [ ] DELETE - Deletar categoria
```

### Category List

```tsx
// src/components/categories/CategoryList.tsx
- [ ] Grid de categorias
- [ ] Categorias padrão vs customizadas
- [ ] Indicador de uso (quantas transações)
- [ ] Progress bar de meta
```

### Category Item

```tsx
// src/components/categories/CategoryItem.tsx
- [ ] Card de categoria
- [ ] Ícone + nome
- [ ] Cor de destaque
- [ ] Meta de gastos
- [ ] Gasto atual
- [ ] Progress bar
- [ ] Actions (edit, delete)
```

### Category Modal

```tsx
// src/components/categories/CategoryModal.tsx
- [ ] Modal de criar/editar
- [ ] Form integration
```

### Category Form

```tsx
// src/components/categories/CategoryForm.tsx
- [ ] Nome
- [ ] Ícone (IconPicker)
- [ ] Cor (opcional)
- [ ] Meta de gastos
- [ ] Categoria pai (para subcategorias)
```

### Icon Picker

```tsx
// src/components/categories/IconPicker.tsx
- [ ] Grid de ícones Lucide
- [ ] Busca de ícones
- [ ] Seleção visual
- [ ] Preview
```

---

## 🎯 PRIORIDADE 5 - Cartões

### API Routes

```tsx
// src/app/api/cards/route.ts
- [ ] GET - Listar cartões
- [ ] POST - Criar cartão
// src/app/api/cards/[id]/route.ts
- [ ] GET - Detalhes do cartão
- [ ] PUT - Atualizar cartão
- [ ] DELETE - Deletar cartão
```

### Card List

```tsx
// src/components/cards/CardList.tsx
- [ ] Grid de cartões
- [ ] Card visual estilo cartão de crédito
- [ ] Limite disponível
- [ ] Gastos do mês
```

### Card Item

```tsx
// src/components/cards/CardItem.tsx
- [ ] Design de cartão de crédito
- [ ] Nome/nickname
- [ ] Limite total e disponível
- [ ] Progress bar do limite
- [ ] Próximo vencimento
- [ ] Badge de status
```

### Card Modal

```tsx
// src/components/cards/CardModal.tsx
- [ ] Modal de criar/editar
```

### Card Form

```tsx
// src/components/cards/CardForm.tsx
- [ ] Nome
- [ ] Nickname
- [ ] Limite
- [ ] Dia de fechamento
- [ ] Dia de vencimento
- [ ] Cor
```

### Invoice View

```tsx
// src/components/cards/InvoiceView.tsx
- [ ] Visualização de fatura
- [ ] Fatura atual
- [ ] Fatura futura
- [ ] Histórico
- [ ] Lista de transações da fatura
- [ ] Total da fatura
```

---

## 🎯 PRIORIDADE 6 - Objetivos

### API Routes

```tsx
// src/app/api/goals/route.ts
- [ ] GET - Listar objetivos
- [ ] POST - Criar objetivo
// src/app/api/goals/[id]/route.ts
- [ ] GET - Detalhes do objetivo
- [ ] PUT - Atualizar objetivo
- [ ] DELETE - Deletar objetivo
// src/app/api/goals/[id]/deposit/route.ts
- [ ] POST - Adicionar depósito
```

### Goal List

```tsx
// src/components/goals/GoalList.tsx
- [ ] Grid de objetivos
- [ ] Progress visual
- [ ] Ordenação por proximidade de atingir meta
```

### Goal Item

```tsx
// src/components/goals/GoalItem.tsx
- [ ] Card de objetivo
- [ ] Nome + ícone
- [ ] Valor atual vs meta
- [ ] Progress bar
- [ ] Percentual atingido
- [ ] Prazo (se tiver)
- [ ] Tempo restante
```

### Goal Modal

```tsx
// src/components/goals/GoalModal.tsx
- [ ] Modal de criar/editar
```

### Goal Form

```tsx
// src/components/goals/GoalForm.tsx
- [ ] Nome
- [ ] Valor da meta
- [ ] Prazo (opcional)
- [ ] Ícone
- [ ] Cor
```

### Deposit Modal

```tsx
// src/components/goals/DepositModal.tsx
- [ ] Modal de adicionar valor
- [ ] Campo de valor
- [ ] Nota/descrição
- [ ] Atualiza o valor atual do objetivo
- [ ] Histórico de depósitos
```

---

## 🎯 PRIORIDADE 7 - Componentes UI Faltantes

### Select

```tsx
// src/components/ui/Select.tsx
- [ ] Dropdown
- [ ] Single select
- [ ] Search
- [ ] Keyboard navigation
```

### Modal

```tsx
// src/components/ui/Modal.tsx
- [ ] Overlay
- [ ] Animações
- [ ] Close button
- [ ] Footer com ações
- [ ] Tamanhos
```

### Toast

```tsx
// src/components/ui/Toast.tsx
- [ ] Provider
- [ ] Tipos (success, error, warning, info)
- [ ] Auto-dismiss
- [ ] Posicionamento
```

### DatePicker

```tsx
// src/components/ui/DatePicker.tsx
- [ ] Calendário visual
- [ ] Range de datas
- [ ] Presets
```

### Skeleton

```tsx
// src/components/ui/Skeleton.tsx
- [ ] Variantes
- [ ] Shimmer animation
```

### Badge

```tsx
// src/components/ui/Badge.tsx
- [ ] Variantes de cor
- [ ] Tamanhos
- [ ] Com ícone
```

### Tabs

```tsx
// src/components/ui/Tabs.tsx
- [ ] Tab navigation
- [ ] Content panels
- [ ] Indicator
```

### Dropdown Menu

```tsx
// src/components/ui/DropdownMenu.tsx
- [ ] Menu contextual
- [ ] Submenus
- [ ] Separadores
```

### Checkbox

```tsx
// src/components/ui/Checkbox.tsx
- [ ] States
- [ ] Label
```

### Radio

```tsx
// src/components/ui/Radio.tsx
- [ ] Groups
- [ ] Label
```

### Switch

```tsx
// src/components/ui/Switch.tsx
- [ ] Toggle
- [ ] Label
- [ ] Animações
```

---

## 🎯 PRIORIDADE 8 - Relatórios

### Reports Page

```tsx
// src/app/(dashboard)/reports/page.tsx
- [ ] Tabs para diferentes relatórios
- [ ] Filtros de período
- [ ] Exportar PDF/CSV
```

### Monthly Report

```tsx
// src/components/reports/MonthlyReport.tsx
- [ ] Resumo do mês
- [ ] Comparativo com mês anterior
- [ ] Gastos por categoria
- [ ] Receitas vs despesas
```

### Charts

```tsx
// src/components/reports/EvolutionChart.tsx
- [ ] Evolução patrimonial
- [ ] Tendências
- [ ] Projeções
```

---

## 🎯 PRIORIDADE 9 - Configurações

### Settings Page

```tsx
// src/app/(dashboard)/settings/page.tsx
- [ ] Tabs: Perfil, Preferências, Segurança
```

### Profile Settings

```tsx
// src/components/settings/ProfileSettings.tsx
- [ ] Editar nome
- [ ] Editar email
- [ ] Upload de foto
```

### Preferences

```tsx
// src/components/settings/Preferences.tsx
- [ ] Moeda
- [ ] Primeiro dia do mês
- [ ] Formato de data
- [ ] Notificações
```

### Security Settings

```tsx
// src/components/settings/SecuritySettings.tsx
- [ ] Alterar senha
- [ ] Sessões ativas
- [ ] Excluir conta
```

---

## 📊 Métricas de Progresso

### Componentes Criados

- ✅ Button (1/35) - 3%
- ✅ Input (2/35) - 6%
- ✅ Card (3/35) - 9%
- ✅ Providers (4/35) - 11%
- ✅ Auth Pages (5/35) - 14%

### Próximo Marco

- 🎯 Layout completo (Sidebar + Header) = 20%
- 🎯 Dashboard funcionando = 35%
- 🎯 CRUD de Transações = 50%
- 🎯 Todos os CRUDs = 70%
- 🎯 Relatórios = 85%
- 🎯 Polish + Testes = 100%

---

**Use este arquivo como checklist durante o desenvolvimento!**
