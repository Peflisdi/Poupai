# 💰 Finaçassss - Controle Financeiro Pessoal

> Plataforma web minimalista de controle financeiro pessoal com design monocromático inspirado em aplicativos modernos como Oinc, Mobills e Pierre Finanças.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?style=flat&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=flat&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4?style=flat&logo=tailwindcss)

## 🎯 Visão Geral

Plataforma de controle financeiro pessoal totalmente gratuita, com foco em:

- ✨ Design minimalista e monocromático
- 🚀 Performance e experiência do usuário
- 📊 Análises e insights financeiros
- 💳 Gestão completa de cartões e parcelamentos
- 🎯 Objetivos de economia (cofrinhos digitais)

## 📋 Funcionalidades

### ✅ MVP Dashboard (Fase 1) - Implementado

**Infraestrutura:**

- [x] Sistema de autenticação completo (Email/Senha + Google OAuth)
- [x] Separação frontend/backend (Services, Hooks, API Routes)
- [x] Type safety completo (TypeScript interfaces)
- [x] Theme system (Light/Dark mode)
- [x] Design monocromático minimalista

**Dashboard:**

- [x] Summary cards (Saldo, Receitas, Despesas)
- [x] Lista de transações recentes
- [x] Sidebar com navegação
- [x] Header com search e user menu
- [x] Layout responsivo

**Backend/API:**

- [x] API Routes para dashboard, transações, categorias
- [x] Autenticação JWT com NextAuth
- [x] Prisma ORM configurado
- [x] Schema completo com 10 models

### 🚧 Em Desenvolvimento (Fase 2)

**Transações:**

- [ ] Página completa de transações
- [ ] Filtros avançados (data, categoria, tipo, método)
- [ ] Modal de criar/editar transação
- [ ] Transações recorrentes
- [ ] Importação de extratos

**Categorias:**

- [ ] Página de gerenciamento de categorias
- [ ] Suporte a subcategorias
- [ ] Ícones e cores personalizáveis

**Visualizações:**

- [ ] Gráficos de despesas por categoria (pizza)
- [ ] Gráfico de evolução temporal (linha)
- [ ] Comparativo mensal

### 📊 Roadmap (Fase 3)

**Cartões de Crédito:**

- [ ] Gestão de cartões
- [ ] Faturas mensais
- [ ] Compras parceladas
- [ ] Limite e alertas

**Objetivos:**

- [ ] Criação de metas financeiras
- [ ] Progress bars
- [ ] Depósitos para objetivos
- [ ] Alertas de conquista

**Relatórios:**

- [ ] Relatórios mensais/anuais
- [ ] Exportação PDF/CSV
- [ ] Comparativos e análises

### 🔮 Futuro (Fase 4)

- [ ] Assistente financeiro com IA
- [ ] Chat para registro de transações
- [ ] Insights e sugestões automáticas
- [ ] Notificações push
- [ ] Aplicativo mobile (React Native)

## 🛠️ Stack Tecnológica

### Frontend & Backend

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Componentes**: Custom UI Components
- **Ícones**: Lucide React
- **Animações**: Framer Motion
- **Gráficos**: Recharts

### Banco de Dados & Auth

- **Banco**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Estado**: Zustand

### Deploy

- **Hospedagem**: Vercel
- **Banco**: Neon PostgreSQL / Supabase / Railway

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado ou acesso a serviço cloud (Neon, Supabase, Railway)
- Conta Google Cloud (opcional, para OAuth)

### Passo a Passo

1. **Clone o repositório**

```bash
git clone <repository-url>
cd Finaçassss
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
# Crie o arquivo .env na raiz do projeto
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finacassss?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Gere com: openssl rand -base64 32

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Configure o banco de dados**

```bash
# Gere o Prisma Client
npm run db:generate

# Execute as migrations
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

6. **Abra no navegador**

```
http://localhost:3000
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Roda o linter
npm run db:push      # Aplica schema do Prisma ao banco
npm run db:studio    # Abre Prisma Studio (GUI do banco)
npm run db:generate  # Gera Prisma Client
```

## 🗄️ Estrutura do Projeto

```
Finaçassss/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── app/
│   │   ├── (auth)/            # Páginas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Páginas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── cards/
│   │   │   ├── goals/
│   │   │   ├── categories/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/               # API Routes
│   │   │   └── auth/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Componentes UI base
│   │   ├── dashboard/         # Componentes do dashboard
│   │   ├── transactions/      # Componentes de transações
│   │   ├── cards/             # Componentes de cartões
│   │   └── providers/         # Context providers
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── auth.ts            # NextAuth config
│       └── utils.ts           # Funções utilitárias
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## 🎨 Sistema de Cores

### Light Mode

- Background: `#FFFFFF`, `#F5F5F5`, `#ECECEC`
- Texto: `#000000`, `#666666`, `#999999`
- Bordas: `#E0E0E0`, `#F0F0F0`
- Acento: `#000000`

### Dark Mode

- Background: `#000000`, `#0A0A0A`, `#1A1A1A`
- Texto: `#FFFFFF`, `#A0A0A0`, `#707070`
- Bordas: `#2A2A2A`, `#1A1A1A`
- Acento: `#FFFFFF`

### Alertas (ambos os temas)

- Erro: `#DC2626` / `#EF4444`
- Aviso: `#F59E0B` / `#FBBF24`
- Sucesso: `#10B981` / `#34D399`
- Info: `#3B82F6` / `#60A5FA`

## 🔐 Configuração do Google OAuth (Opcional)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Configure o consentimento screen
6. Adicione os URIs autorizados:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.com` (produção)
7. Adicione os redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://seu-dominio.com/api/auth/callback/google`
8. Copie o Client ID e Client Secret para o `.env`

## 🗃️ Banco de Dados

### Usando Neon (Recomendado - Free Tier)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string
5. Cole no `.env` em `DATABASE_URL`

### Usando PostgreSQL Local

```bash
# Instale PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Crie o banco de dados
createdb finacassss

# Configure DATABASE_URL no .env
DATABASE_URL="postgresql://postgres:sua-senha@localhost:5432/finacassss?schema=public"
```

## 📱 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub/GitLab/Bitbucket
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

### Variáveis de Ambiente no Vercel

```
DATABASE_URL=sua-connection-string-aqui
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui
GOOGLE_CLIENT_ID=seu-client-id (opcional)
GOOGLE_CLIENT_SECRET=seu-client-secret (opcional)
```

## 🤝 Contribuição

Este é um projeto pessoal e para círculo próximo, mas sugestões são bem-vindas!

## 📄 Licença

Uso pessoal e privado.

## 👨‍💻 Autor

Desenvolvido com ❤️ para controle financeiro pessoal.

---

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 🐛 Troubleshooting

### Erro ao conectar no banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Tente rodar `npm run db:push` novamente

### Erro de autenticação

- Verifique o `NEXTAUTH_SECRET` no `.env`
- Confirme que `NEXTAUTH_URL` está correto
- Limpe cookies do navegador

### Erro de build

- Delete `node_modules` e `.next`
- Rode `npm install` novamente
- Rode `npm run db:generate`

---

**Status**: 🚧 Em Desenvolvimento - MVP Completo
