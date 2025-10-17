# 🎨 DESIGN SHOWCASE - Finaçassss

## Paleta de Cores Monocromática

### Light Mode

```
┌─────────────────────────────────────────┐
│                                         │
│  🤍 Primary Background    #FFFFFF       │
│  ⬜ Secondary Background  #F5F5F5       │
│  ◻️  Tertiary Background   #ECECEC       │
│                                         │
│  ⬛ Primary Text          #000000       │
│  ▪️  Secondary Text        #666666       │
│  ▫️  Tertiary Text         #999999       │
│                                         │
│  ➖ Primary Border        #E0E0E0       │
│  ➖ Subtle Border         #F0F0F0       │
│                                         │
└─────────────────────────────────────────┘
```

### Dark Mode

```
┌─────────────────────────────────────────┐
│                                         │
│  ⬛ Primary Background    #000000       │
│  ◾ Secondary Background  #0A0A0A       │
│  ▪️  Tertiary Background   #1A1A1A       │
│                                         │
│  🤍 Primary Text          #FFFFFF       │
│  ⬜ Secondary Text        #A0A0A0       │
│  ◻️  Tertiary Text         #707070       │
│                                         │
│  ➖ Primary Border        #2A2A2A       │
│  ➖ Subtle Border         #1A1A1A       │
│                                         │
└─────────────────────────────────────────┘
```

### Cores de Alerta

```
🔴 Error     Light: #DC2626    Dark: #EF4444
🟠 Warning   Light: #F59E0B    Dark: #FBBF24
🟢 Success   Light: #10B981    Dark: #34D399
🔵 Info      Light: #3B82F6    Dark: #60A5FA
```

---

## Tipografia

```
╔══════════════════════════════════════════╗
║                                          ║
║  H1: Finaçassss                          ║
║      36px · Bold (700) · Inter           ║
║                                          ║
║  H2: Dashboard Principal                 ║
║      28px · Semibold (600) · Inter       ║
║                                          ║
║  H3: Últimas Transações                  ║
║      20px · Semibold (600) · Inter       ║
║                                          ║
║  Body: Texto padrão do conteúdo          ║
║        16px · Regular (400) · Inter      ║
║                                          ║
║  Small: Texto secundário pequeno         ║
║         14px · Regular (400) · Inter     ║
║                                          ║
║  Micro: Metadados e legendas             ║
║         12px · Regular (400) · Inter     ║
║                                          ║
║  Currency: R$ 1.234,56                   ║
║            28px · Bold (700) · Mono      ║
║                                          ║
╚══════════════════════════════════════════╝
```

---

## Componentes UI

### Button

```
┌──────────────────────────────────────┐
│                                      │
│  Primary Button      ⬛ Preto        │
│  ┌──────────────────┐                │
│  │   Criar Conta    │                │
│  └──────────────────┘                │
│                                      │
│  Secondary Button    ◻️ Outline      │
│  ┌──────────────────┐                │
│  │   Cancelar       │                │
│  └──────────────────┘                │
│                                      │
│  Ghost Button        Transparente    │
│  ┌──────────────────┐                │
│  │   Ver mais       │                │
│  └──────────────────┘                │
│                                      │
│  Danger Button       🔴 Vermelho     │
│  ┌──────────────────┐                │
│  │   Excluir        │                │
│  └──────────────────┘                │
│                                      │
└──────────────────────────────────────┘
```

### Input

```
┌──────────────────────────────────────┐
│                                      │
│  Email                               │
│  ┌────────────────────────────────┐  │
│  │ seu@email.com                  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Senha                               │
│  ┌────────────────────────────────┐  │
│  │ ••••••••                       │  │
│  └────────────────────────────────┘  │
│  ℹ️  Mínimo 6 caracteres             │
│                                      │
│  Com Erro                            │
│  ┌────────────────────────────────┐  │
│  │ valor inválido                 │  │
│  └────────────────────────────────┘  │
│  ❌ Este campo é obrigatório         │
│                                      │
└──────────────────────────────────────┘
```

### Card

```
┌─────────────────────────────────────────┐
│                                         │
│  📊 Resumo Financeiro                   │
│  ─────────────────────────────────────  │
│                                         │
│  Saldo Atual                            │
│  R$ 5.432,10                            │
│                                         │
│  Gastos do Mês                          │
│  R$ 3.210,00                            │
│                                         │
│  Receitas do Mês                        │
│  R$ 8.642,10                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Layouts de Página

### Login Page

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   Finaçassss                        │
│            Controle financeiro minimalista          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │  Entrar                                       │ │
│  │  Entre com sua conta para continuar           │ │
│  │                                               │ │
│  │  Email                                        │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │ seu@email.com                           │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  Senha                                        │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │ ••••••••                                │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │          🔐 Entrar                      │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  ──────────── ou continue com ────────────   │ │
│  │                                               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │          🔵 Google                      │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │                                               │ │
│  │  Não tem uma conta? Criar conta              │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Dashboard (Futuro)

```
┌─────────────────────────────────────────────────────────────┐
│  ☰  Finaçassss           🔍 Buscar...    🔔  🌓  👤        │
├─────┬───────────────────────────────────────────────────────┤
│     │                                                       │
│  🏠 │  Dashboard                                            │
│  💰 │                                                       │
│  💳 │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  🎯 │  │  Saldo   │  │  Gastos  │  │ Receitas │           │
│  📁 │  │ R$ 5.4k  │  │ R$ 3.2k  │  │ R$ 8.6k  │           │
│  📊 │  └──────────┘  └──────────┘  └──────────┘           │
│  ⚙️  │                                                       │
│     │  ┌──────────────────────────────────────────────┐    │
│     │  │                                              │    │
│     │  │         📊 Gráfico de Categorias            │    │
│     │  │                                              │    │
│     │  └──────────────────────────────────────────────┘    │
│     │                                                       │
│     │  📝 Últimas Transações                               │
│     │  ┌──────────────────────────────────────────────┐    │
│     │  │ 🍔 Alimentação    -R$ 45,00    Hoje          │    │
│     │  │ 🚗 Transporte     -R$ 30,00    Ontem         │    │
│     │  │ 💼 Salário        +R$ 5.000    15/10         │    │
│     │  └──────────────────────────────────────────────┘    │
│     │                                                       │
└─────┴───────────────────────────────────────────────────────┘
```

---

## Animações

### Fade In

```
Entrada suave de elementos
Opacidade: 0 → 1
Transform: translateY(10px) → translateY(0)
Duração: 300ms
Timing: ease-out
```

### Slide In

```
Entrada lateral (sidebar, modals)
Transform: translateX(-100%) → translateX(0)
Duração: 300ms
Timing: ease-out
```

### Hover Effects

```
Buttons: opacity 100% → 90%
Cards: background-color smooth transition
Links: underline appear
Duração: 150ms
```

---

## Responsividade

### Mobile (< 768px)

```
┌───────────────┐
│  ☰  Finaçassss│
│               │
│  Saldo Atual  │
│  R$ 5.432,10  │
│               │
│  Gastos       │
│  R$ 3.210,00  │
│               │
│  Receitas     │
│  R$ 8.642,10  │
│               │
│  📊 Gráfico   │
│               │
│  Transações   │
│  • Item 1     │
│  • Item 2     │
│  • Item 3     │
│               │
└───────────────┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────┐
│  ☰  Finaçassss    🔍  🔔 👤│
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │Saldo │ │Gastos│ │Receit││
│  │5.4k  │ │3.2k  │ │8.6k  ││
│  └──────┘ └──────┘ └──────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   📊 Gráfico           ││
│  └─────────────────────────┘│
│                             │
│  Últimas Transações         │
│  • Item 1                   │
│  • Item 2                   │
│                             │
└─────────────────────────────┘
```

### Desktop (> 1024px)

```
┌───────────────────────────────────────────┐
│  ☰  Finaçassss    🔍 Buscar...   🔔 🌓 👤│
├─────┬─────────────────────────────────────┤
│     │                                     │
│ 🏠  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│ 💰  │  │Saldo│ │Gasto│ │Recei│ │%Orç │  │
│ 💳  │  └─────┘ └─────┘ └─────┘ └─────┘  │
│ 🎯  │                                     │
│ 📁  │  ┌────────────┐  ┌──────────────┐  │
│ 📊  │  │            │  │              │  │
│ ⚙️   │  │  Gráfico   │  │  Transações  │  │
│     │  │            │  │              │  │
│     │  └────────────┘  └──────────────┘  │
└─────┴─────────────────────────────────────┘
```

---

## Estados dos Componentes

### Button States

```
Normal      ┌──────────┐
            │  Entrar  │
            └──────────┘

Hover       ┌──────────┐
            │  Entrar  │  ← opacity: 90%
            └──────────┘

Loading     ┌──────────┐
            │ ⏳ Entrar│
            └──────────┘

Disabled    ┌──────────┐
            │  Entrar  │  ← opacity: 50%
            └──────────┘
```

### Input States

```
Normal      ┌────────────────┐
            │ Placeholder    │
            └────────────────┘

Focus       ┌────────────────┐
            │ Texto aqui...  │  ← borda mais grossa
            └────────────────┘

Error       ┌────────────────┐
            │ Valor inválido │  ← borda vermelha
            └────────────────┘
            ❌ Mensagem de erro

Success     ┌────────────────┐
            │ email@ok.com   │  ← borda verde
            └────────────────┘
```

---

## Ícones (Lucide React)

### Categorias

```
🍴 Alimentação    → Utensils
🚗 Transporte     → Car
🏠 Moradia        → Home
😊 Lazer          → Smile
❤️  Saúde          → Heart
🎓 Educação       → GraduationCap
👕 Vestuário      → Shirt
⋯  Outros         → MoreHorizontal
```

### Ações

```
➕ Adicionar      → Plus
✏️  Editar         → Edit
🗑️  Deletar        → Trash2
👁️  Visualizar     → Eye
💾 Salvar         → Save
❌ Cancelar       → X
✅ Confirmar      → Check
```

### Navegação

```
🏠 Dashboard      → LayoutDashboard
💰 Transações     → ArrowLeftRight
💳 Cartões        → CreditCard
🎯 Objetivos      → Target
📁 Categorias     → FolderOpen
📊 Relatórios     → BarChart3
⚙️  Configurações  → Settings
```

---

## Princípios de Design

### 1. Minimalismo Extremo

```
✅ Bordas simples ao invés de sombras
✅ Espaçamento generoso (white space)
✅ Tipografia como elemento de design
✅ Grid system bem definido
✅ Apenas preto, branco e cinza
```

### 2. Hierarquia Visual

```
✅ Tamanhos de fonte distintos
✅ Pesos de fonte para ênfase
✅ Espaçamento para separação
✅ Cores de alerta pontuais
✅ Posicionamento estratégico
```

### 3. Consistência

```
✅ Mesmos componentes em toda app
✅ Mesmos espaçamentos
✅ Mesmas animações
✅ Mesmo tom de linguagem
✅ Mesmo padrão de interação
```

### 4. Acessibilidade

```
✅ Contraste adequado (WCAG AA)
✅ Tamanhos de fonte legíveis
✅ Áreas de toque > 44x44px
✅ Estados de foco visíveis
✅ Suporte a leitores de tela
```

---

## Grid System

```
Mobile (< 768px)
┌─────────────────┐
│ 1 coluna        │
│ Padding: 16px   │
│ Gap: 16px       │
└─────────────────┘

Tablet (768px - 1024px)
┌─────────────────────────────┐
│ 2 colunas                   │
│ Padding: 24px               │
│ Gap: 24px                   │
└─────────────────────────────┘

Desktop (> 1024px)
┌─────────────────────────────────────┐
│ 3-4 colunas                         │
│ Padding: 32px                       │
│ Gap: 32px                           │
└─────────────────────────────────────┘
```

---

**Design System Completo e Pronto para Uso! 🎨✨**
