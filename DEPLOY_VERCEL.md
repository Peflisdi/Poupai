# 🚀 Deploy na Vercel - Guia Rápido

Siga este guia para fazer o deploy do FinControl na Vercel em **15 minutos**.

---

## 📋 Pré-requisitos

✅ Código commitado no GitHub (FEITO!)
✅ Banco Neon configurado (FEITO!)
✅ Credenciais do Neon em mãos

---

## Passo 1: Importar Projeto na Vercel (5 min)

### 1.1 - Acesse a Vercel

```
https://vercel.com
```

### 1.2 - Login com GitHub

- Clique em **"Sign Up"** ou **"Login"**
- Escolha **"Continue with GitHub"**
- Autorize a Vercel

### 1.3 - Importar Repositório

1. No dashboard, clique em **"Add New..."** → **"Project"**
2. Procure por **"FinControl"** (ou Peflisdi/FinControl)
3. Clique em **"Import"**

✅ **Repositório importado!**

---

## Passo 2: Configurar Variáveis de Ambiente (5 min)

⚠️ **IMPORTANTE:** Configure ANTES de fazer deploy!

### 2.1 - Na tela de configuração do projeto

Você verá **"Configure Project"**. Role até **"Environment Variables"**.

### 2.2 - Adicionar as 4 variáveis

Clique em **"Add"** para cada uma:

#### **1. DATABASE_URL**

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_mBVUO2vF5yIw@ep-crimson-recipe-ac632anp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### **2. DIRECT_URL**

```
Name: DIRECT_URL
Value: postgresql://neondb_owner:npg_mBVUO2vF5yIw@ep-crimson-recipe-ac632anp.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### **3. NEXTAUTH_URL**

```
Name: NEXTAUTH_URL
Value: https://seu-projeto.vercel.app
```

⚠️ **Deixe em branco por enquanto** - vamos preencher depois do primeiro deploy!

#### **4. NEXTAUTH_SECRET**

```
Name: NEXTAUTH_SECRET
Value: mUobEHBsM6oLFpbxWEC7gWzgmIEgJc2WacMigyy0OHU=
```

(copie do seu arquivo `.env` local)

### 2.3 - Verificar configurações

Certifique-se que:

- ✅ **Framework Preset:** Next.js (detectado automaticamente)
- ✅ **Root Directory:** ./
- ✅ **Build Command:** `npm run vercel-build` (ou deixe padrão)
- ✅ **Output Directory:** .next (padrão)

---

## Passo 3: Deploy Inicial (3 min)

### 3.1 - Fazer primeiro deploy

Clique em **"Deploy"** 🚀

### 3.2 - Aguardar build

Você verá:

```
Building...
├── Installing dependencies
├── Running prisma generate
├── Running prisma migrate deploy
├── Building Next.js
└── Optimizing...
```

Tempo estimado: **2-3 minutos**

### 3.3 - Deploy concluído!

Você verá:

```
✅ Deployment Ready!
🔗 https://fincontrol-xxx.vercel.app
```

⚠️ **NÃO clique no link ainda!** Precisamos atualizar o NEXTAUTH_URL.

---

## Passo 4: Configurar NEXTAUTH_URL (2 min)

### 4.1 - Copiar URL do projeto

Copie a URL do deploy, exemplo:

```
https://fincontrol-abc123.vercel.app
```

### 4.2 - Atualizar variável

1. No projeto da Vercel, vá em **"Settings"** → **"Environment Variables"**
2. Encontre **NEXTAUTH_URL**
3. Clique em **"Edit"**
4. Cole a URL: `https://fincontrol-abc123.vercel.app`
5. Clique em **"Save"**

### 4.3 - Redeploy

1. Vá em **"Deployments"**
2. Clique nos **três pontinhos** ⋮ do último deploy
3. Clique em **"Redeploy"**
4. Confirme **"Redeploy"**

Aguarde ~1 minuto.

---

## Passo 5: Testar Aplicação (2 min)

### 5.1 - Abrir aplicação

Clique no link do deploy ou acesse:

```
https://seu-projeto.vercel.app
```

### 5.2 - Fazer login

Use as credenciais do seed:

- 📧 **Email:** `demo@finacassss.app`
- 🔑 **Senha:** `123456`

### 5.3 - Verificar funcionalidades

- ✅ Dashboard carrega?
- ✅ Transações aparecem?
- ✅ Pode criar nova transação?
- ✅ Categorias funcionam?
- ✅ Relatórios carregam?

---

## 🎉 Deploy Completo!

Seu app está no ar! 🚀

### 📊 URLs importantes:

- 🌐 **Aplicação:** https://seu-projeto.vercel.app
- 📊 **Dashboard Vercel:** https://vercel.com/dashboard
- 🗄️ **Dashboard Neon:** https://console.neon.tech

---

## 🔧 Configurações Opcionais

### Custom Domain (se quiser)

1. No projeto Vercel → **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio: `fincontrol.com.br`
4. Siga instruções de DNS

### Otimizações Automáticas da Vercel

✅ **CDN Global** - Deploy em 20+ regiões
✅ **Auto HTTPS** - SSL/TLS automático
✅ **Image Optimization** - Next.js Image otimizado
✅ **Edge Functions** - APIs ultra-rápidas
✅ **Analytics** - Métricas de performance
✅ **Preview Deploys** - Deploy automático em PRs

---

## 🆘 Troubleshooting

### Erro: "Build failed"

**Possível causa:** Environment variables incorretas

**Solução:**

1. Vá em **Settings** → **Environment Variables**
2. Verifique se todas as 4 variáveis estão corretas
3. Faça **Redeploy**

### Erro: "Database connection failed"

**Possível causa:** DATABASE_URL ou DIRECT_URL incorretos

**Solução:**

1. Vá no **Neon Dashboard** → Connection Details
2. Copie novamente as strings
3. Atualize no Vercel → **Settings** → **Environment Variables**
4. Faça **Redeploy**

### Erro: "NextAuth configuration error"

**Possível causa:** NEXTAUTH_URL não configurado

**Solução:**

1. Copie a URL do deploy: `https://seu-projeto.vercel.app`
2. Atualize NEXTAUTH_URL com essa URL
3. Faça **Redeploy**

### Erro: "Prisma migration failed"

**Possível causa:** Migrations não executadas no Neon

**Solução local:**

```powershell
npx prisma migrate deploy
```

---

## 📈 Próximos Passos

Após deploy bem-sucedido:

1. ✅ **Criar seu próprio usuário** (não use o demo em produção)
2. ✅ **Deletar dados de seed** (se quiser começar do zero)
3. ✅ **Configurar Google OAuth** (opcional, para login social)
4. ✅ **Monitorar no Vercel Analytics**
5. ✅ **Configurar Neon Branching** (para dev/staging)

---

## 🎯 Checklist Final

Antes de considerar deploy completo:

- [ ] ✅ App abre sem erros
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard carrega dados
- [ ] ✅ Pode criar transação
- [ ] ✅ Pode criar categoria
- [ ] ✅ Relatórios funcionam
- [ ] ✅ Busca funciona (Ctrl+K)
- [ ] ✅ Modo escuro funciona
- [ ] ✅ Responsivo no mobile

---

## 💡 Dicas Pro

### Deploy Automático

Toda vez que você fizer `git push`, a Vercel faz deploy automaticamente! 🎯

### Preview Deploys

Cada Pull Request gera um deploy de preview para testar antes de mergear.

### Rollback Instantâneo

Se algo der errado, você pode fazer rollback em 1 clique no dashboard.

### Monitoramento

Ative **Vercel Analytics** para ver:

- Tempo de carregamento
- Core Web Vitals
- Erros em tempo real

---

## 🎊 Parabéns!

Você acabou de fazer deploy de uma aplicação full-stack Next.js 14 com:

- ✅ Autenticação (NextAuth)
- ✅ Banco de dados serverless (Neon)
- ✅ ORM moderno (Prisma)
- ✅ UI/UX profissional (Tailwind)
- ✅ Deploy automático (Vercel)

🚀 **Seu app está pronto para produção!**

---

**Desenvolvido com ❤️**
**Deploy powered by Vercel + Neon**
