# 🚀 Guia de Deploy - Finaçassss

Deploy do projeto Next.js na **Vercel** com banco de dados **PostgreSQL no Neon** (100% gratuito).

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Projeto commitado no repositório
- ✅ Conta na Vercel (gratuita)
- ✅ Conta no Neon (gratuita)

---

## 1️⃣ Criar Banco de Dados PostgreSQL (Neon)

### Passo 1: Criar conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"**
3. Use sua conta do GitHub para login rápido

### Passo 2: Criar projeto

1. Clique em **"Create Project"**
2. Nome do projeto: `finacassss` (ou qualquer nome)
3. Região: **São Paulo (AWS South America)** - mais próximo do Brasil
4. PostgreSQL version: **15** (recomendado)
5. Clique em **"Create Project"**

### Passo 3: Copiar credenciais

Após criar o projeto, você verá uma tela com as credenciais:

```bash
# Connection String (para DATABASE_URL)
postgresql://[user]:[password]@[host]/[database]?sslmode=require

# Direct Connection String (para DIRECT_URL)
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

⚠️ **IMPORTANTE:** Salve essas credenciais! Você vai precisar delas.

---

## 2️⃣ Deploy na Vercel

### Passo 1: Criar conta na Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Use sua conta do GitHub

### Passo 2: Importar projeto

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Selecione seu repositório **"FinControl"** (ou nome do seu repo)
3. Clique em **"Import"**

### Passo 3: Configurar variáveis de ambiente

Na tela de configuração do projeto, vá em **"Environment Variables"** e adicione:

```env
DATABASE_URL
postgresql://[copie-do-neon]?sslmode=require

DIRECT_URL
postgresql://[copie-do-neon]?sslmode=require

NEXTAUTH_URL
https://seu-projeto.vercel.app (você vai pegar isso depois)

NEXTAUTH_SECRET
[gere um secret - veja abaixo]
```

#### Como gerar NEXTAUTH_SECRET:

Opção 1 - Online:

- Acesse: https://generate-secret.vercel.app/32
- Copie o valor gerado

Opção 2 - Terminal:

```bash
openssl rand -base64 32
```

### Passo 4: Deploy inicial

1. Clique em **"Deploy"**
2. Aguarde ~2 minutos
3. ⚠️ **O primeiro deploy VAI FALHAR** - é normal!
4. Copie a URL do projeto (ex: `https://seu-projeto.vercel.app`)

### Passo 5: Atualizar NEXTAUTH_URL

1. Vá em **Settings** → **Environment Variables**
2. Edite `NEXTAUTH_URL`
3. Cole a URL do seu projeto: `https://seu-projeto.vercel.app`
4. Clique em **"Save"**

### Passo 6: Executar migrações do banco

1. Na página do projeto na Vercel, vá em **Settings** → **General**
2. Copie o **"Git Repository"** URL
3. Clone o projeto localmente (se ainda não tiver)
4. No terminal, execute:

```bash
# Instalar dependências
npm install

# Criar arquivo .env com as credenciais
# Cole as mesmas variáveis que você configurou na Vercel
echo "DATABASE_URL=postgresql://..." > .env
echo "DIRECT_URL=postgresql://..." >> .env
echo "NEXTAUTH_URL=https://seu-projeto.vercel.app" >> .env
echo "NEXTAUTH_SECRET=seu-secret" >> .env

# Executar migrações
npx prisma migrate deploy

# (Opcional) Popular banco com dados de exemplo
npx prisma db seed
```

### Passo 7: Redeploy

1. Volte para o dashboard da Vercel
2. Vá em **"Deployments"**
3. Clique nos **três pontinhos** no último deploy
4. Clique em **"Redeploy"**
5. Aguarde ~2 minutos

---

## 3️⃣ Verificar Deploy

1. Acesse a URL do projeto: `https://seu-projeto.vercel.app`
2. Você deve ver a tela de login
3. **Login de teste** (se executou o seed):
   - Email: `demo@finacassss.app`
   - Senha: `123456`

---

## 4️⃣ Configurações Pós-Deploy

### Configurar domínio personalizado (opcional)

1. Na Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Siga as instruções para configurar DNS

### Monitoramento

- A Vercel fornece logs automáticos em **"Deployments"** → **"View Function Logs"**
- Você pode ver erros em tempo real

---

## 🔄 Como Fazer Alterações no Futuro

### Alterações de Código (UI, lógica, etc.)

✅ **SEGURO - Não perde dados**

```bash
# 1. Faça suas alterações no código
# 2. Commit e push para o GitHub
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. A Vercel faz deploy automático!
```

### Alterações no Banco de Dados (schema)

⚠️ **CUIDADO - Precisa de migração**

```bash
# 1. Altere o schema.prisma
# 2. Crie uma migração
npx prisma migrate dev --name descricao_da_alteracao

# 3. Commit os arquivos da migração
git add prisma/migrations
git commit -m "feat: adiciona campo X na tabela Y"
git push origin main

# 4. A Vercel executará a migração automaticamente no deploy
```

#### Exemplos de alterações SEGURAS:

✅ Adicionar nova coluna (com valor padrão)
✅ Criar nova tabela
✅ Adicionar índices
✅ Renomear campos (com cuidado)

#### Exemplos de alterações ARRISCADAS:

❌ Deletar colunas com dados
❌ Mudar tipo de coluna incompatível
❌ Deletar tabelas

---

## 🐛 Troubleshooting

### Erro: "PrismaClient is unable to run in the browser"

**Solução:** Adicione `"use server"` no topo dos arquivos de API

### Erro: "Database connection timeout"

**Solução:** Verifique se as credenciais do Neon estão corretas nas env vars da Vercel

### Erro: "Table X doesn't exist"

**Solução:** Execute `npx prisma migrate deploy` no terminal local primeiro

### Erro de autenticação

**Solução:** Verifique se `NEXTAUTH_URL` aponta para a URL correta do projeto

---

## 📊 Limites do Plano Gratuito

### Vercel Free Tier

- ✅ Projetos ilimitados
- ✅ 100GB bandwidth/mês
- ✅ Serverless functions ilimitadas
- ✅ Deploy automático
- ✅ SSL/HTTPS grátis
- ✅ Preview deployments

### Neon Free Tier

- ✅ 1 projeto
- ✅ 10 branches (dev/staging)
- ✅ 512MB storage
- ✅ 100 horas de computação/mês
- ✅ Backups automáticos (7 dias)

**Suficiente para:**

- 🎯 Projetos pessoais
- 🎯 Portfólio
- 🎯 MVP/Protótipos
- 🎯 ~100-1000 usuários ativos

---

## 🔐 Segurança

### Credenciais

- ❌ **NUNCA** commite o arquivo `.env`
- ✅ Use variáveis de ambiente da Vercel
- ✅ Gere um `NEXTAUTH_SECRET` forte

### Banco de dados

- ✅ Neon usa SSL por padrão
- ✅ Credenciais rotacionadas automaticamente
- ✅ Backups automáticos diários

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✅ Checklist Final

Antes de compartilhar o projeto:

- [ ] Deploy funcionando na Vercel
- [ ] Banco de dados conectado
- [ ] Migrações executadas
- [ ] Login funcionando
- [ ] Criar primeira transação funciona
- [ ] Dark mode funcionando
- [ ] Responsivo em mobile

---

🎉 **Pronto! Seu projeto está no ar!**

Compartilhe a URL: `https://seu-projeto.vercel.app`
