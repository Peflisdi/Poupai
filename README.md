# 💰 FinControl

> Sistema completo de controle financeiro pessoal desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das finanças com gráficos interativos
- Gráfico de rosca (donut) com categorias de gastos
- Gráfico de tendências mensais
- Resumo de receitas, despesas e saldo

### 💳 Gestão de Cartões
- Cadastro e gerenciamento de cartões de crédito
- Visualização detalhada de faturas
- Breakdown por categoria com gráfico interativo
- Accordion com detalhamento de transações por categoria

### 💰 Transações
- Registro de receitas e despesas
- Suporte a parcelamentos
- Filtros por tipo, categoria, conta e período
- Edição e exclusão de transações

### 🎯 Metas Financeiras
- Criação de metas com valores-alvo e prazos
- Acompanhamento de progresso com barras visuais
- Sistema de depósitos para as metas
- Indicadores de status (concluída, atrasada, no prazo)
- 12 ícones e 12 cores personalizáveis

### 🏷️ Categorias
- Gestão de categorias de receitas e despesas
- Ícones personalizados para cada categoria
- Sistema de orçamentos por categoria

### 🌓 Temas
- Modo claro e escuro
- Transições suaves entre temas
- Design responsivo para todos os dispositivos

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Database**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Gráficos**: Componentes personalizados com SVG

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fincontrol.git

# Entre na pasta
cd fincontrol

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Execute as migrations do Prisma
npx prisma migrate dev

# (Opcional) Popule o banco com dados de exemplo
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fincontrol"

# NextAuth
NEXTAUTH_SECRET="seu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm start            # Inicia servidor de produção
npm run lint         # Executa o linter
```

## 🎨 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── transactions/ # Gestão de transações
│   │   ├── cards/        # Gestão de cartões
│   │   ├── goals/        # Metas financeiras
│   │   └── categories/   # Categorias
│   ├── api/               # API Routes
│   └── auth/              # Páginas de autenticação
├── components/            # Componentes React
│   ├── cards/            # Componentes de cartões
│   ├── dashboard/        # Componentes do dashboard
│   ├── goals/            # Componentes de metas
│   ├── layout/           # Layout e navegação
│   ├── transactions/     # Componentes de transações
│   └── ui/               # Componentes UI básicos
├── hooks/                # Custom React Hooks
├── lib/                  # Utilitários e configurações
├── services/             # Camada de serviços (API)
└── types/                # Definições TypeScript
```

## 🔐 Segurança

- Autenticação com NextAuth.js
- Proteção de rotas com middleware
- Validação de dados no servidor
- Senhas criptografadas com bcrypt
- Variáveis de ambiente para dados sensíveis

## 🎯 Roadmap

- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações de vencimento
- [ ] Integração com APIs bancárias
- [ ] App mobile (React Native)
- [ ] Compartilhamento de orçamento familiar

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.
