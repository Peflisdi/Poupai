# 🚀 Guia de Migração: Supabase → Neon

Migração do banco de dados PostgreSQL do Supabase para o Neon.tech (100% gratuito e mais rápido).

---

## 📋 O que você vai precisar:

- ✅ 10 minutos de tempo
- ✅ Conta no Neon (grátis)
- ✅ Acesso ao projeto

---

## Passo 1: Criar Conta no Neon (2 minutos)

### 1.1 - Acesse o Neon

```
https://neon.tech
```

### 1.2 - Crie sua conta

- Clique em **"Sign Up"**
- Use sua conta do **GitHub** (mais rápido)
- Autorize o acesso

✅ **Conta criada!**

---

## Passo 2: Criar Projeto no Neon (3 minutos)

### 2.1 - Criar novo projeto

1. No dashboard do Neon, clique em **"Create a project"**
2. Preencha:
   - **Project name:** `finacassss` (ou o nome que preferir)
   - **Region:** **South America (São Paulo) - AWS** ⚡ (mais próximo do Brasil!)
   - **PostgreSQL version:** **16** (mais recente)
3. Clique em **"Create project"**

### 2.2 - Copiar credenciais

Após criar, você verá uma tela com as **Connection Strings**:

![Neon Connection Strings](https://neon.tech/docs/_next/image?url=%2Fdocs-images%2Fconnection-string.png&w=1920&q=75)

Você verá **2 strings de conexão**:

#### **A) Pooled connection** (para DATABASE_URL)

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

#### **B) Direct connection** (para DIRECT_URL)

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&connect_timeout=10
```

⚠️ **IMPORTANTE:** Copie ambas! Você vai usar nos próximos passos.

---

## Passo 3: Atualizar Variáveis de Ambiente (2 minutos)

### 3.1 - Atualizar arquivo `.env` local

Abra o arquivo `.env` na raiz do projeto e **substitua** as credenciais antigas do Supabase:

```env
# ===== ANTES (Supabase) =====
# DATABASE_URL="postgresql://postgres.xxx@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# ===== DEPOIS (Neon) =====
DATABASE_URL="postgresql://[copie-a-pooled-connection-do-neon]"
DIRECT_URL="postgresql://[copie-a-direct-connection-do-neon]"

# NextAuth (mantenha como está)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[seu-secret-atual]"
```

### 3.2 - Salvar o arquivo

Pressione **Ctrl + S** para salvar.

---

## Passo 4: Executar Migrations (3 minutos)

Agora vamos criar a estrutura do banco no Neon:

### 4.1 - Limpar cliente Prisma

```powershell
npx prisma generate
```

### 4.2 - Aplicar migrations

```powershell
npx prisma migrate deploy
```

Você deve ver algo como:

```
✅ Applying migration `20241018000000_initial_schema`
✅ Database migrations applied successfully
```

### 4.3 - Popular banco com dados de exemplo (opcional)

```powershell
npx prisma db seed
```

Isso criará:

- ✅ 1 usuário demo (email: demo@finacassss.app, senha: 123456)
- ✅ 3 cartões de crédito (Nubank, Inter, C6)
- ✅ 10 categorias
- ✅ 40 transações de exemplo

---

## Passo 5: Testar Localmente (2 minutos)

### 5.1 - Iniciar servidor de desenvolvimento

```powershell
npm run dev
```

### 5.2 - Abrir no navegador

```
http://localhost:3000
```

### 5.3 - Fazer login

Se executou o seed, use:

- **Email:** demo@finacassss.app
- **Senha:** 123456

### 5.4 - Testar funcionalidades

- ✅ Criar uma nova transação
- ✅ Ver o dashboard
- ✅ Criar uma categoria
- ✅ Tudo funcionando? Perfeito!

---

## Passo 6: Atualizar Vercel (se já fez deploy)

Se você já tem o projeto na Vercel, precisa atualizar as variáveis de ambiente:

### 6.1 - Acessar Vercel

```
https://vercel.com/dashboard
```

### 6.2 - Abrir seu projeto

Clique no projeto **FinControl**

### 6.3 - Atualizar Environment Variables

1. Vá em **Settings** → **Environment Variables**
2. Edite as variáveis:
   - **DATABASE_URL** → Cole a **Pooled connection** do Neon
   - **DIRECT_URL** → Cole a **Direct connection** do Neon
3. Clique em **Save**

### 6.4 - Redeploy

1. Vá em **Deployments**
2. Clique nos **três pontinhos** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde ~2 minutos

✅ **Deploy atualizado com Neon!**

---

## 🎉 Migração Completa!

### ✅ Checklist Final:

- [ ] Conta criada no Neon
- [ ] Projeto criado no Neon
- [ ] Credenciais copiadas
- [ ] `.env` atualizado localmente
- [ ] Migrations executadas
- [ ] Seed executado (opcional)
- [ ] Testado localmente
- [ ] Variáveis atualizadas na Vercel (se aplicável)
- [ ] Redeploy feito na Vercel (se aplicável)

---

## 📊 Comparação: Supabase vs Neon

| Recurso            | Supabase (Antes)   | Neon (Agora)      | Melhoria              |
| ------------------ | ------------------ | ----------------- | --------------------- |
| Cold Start         | ~2-3s              | <500ms            | 🚀 4-6x mais rápido   |
| Connection Pooling | Manual (pgBouncer) | Automático        | ✨ Mais fácil         |
| Scale to Zero      | ❌ Não             | ✅ Sim            | 💰 Economiza recursos |
| Branching          | ❌ Não             | ✅ Sim (Git-like) | 🎯 Perfeito para dev  |
| Projetos Free      | 2                  | 10 branches       | 📈 5x mais            |
| Integração Vercel  | OK                 | Perfeita          | ⚡ Nativa             |

---

## 💡 Vantagens do Neon:

### 🚀 Performance

- **Serverless nativo** - Cold starts <500ms
- **Auto-scaling** - Escala automaticamente
- **Connection pooling** - Automático e otimizado

### 💰 Economia

- **Scale to zero** - Desliga quando não usa
- **Pay per compute** - Só paga pelo que usa (free tier é generoso)

### 🛠️ Developer Experience

- **Branching** - Crie DBs de teste como branches Git
- **Time travel** - Restaure banco para qualquer ponto
- **Instant copy** - Clone DBs em segundos

### 🔐 Segurança

- **SSL obrigatório** - Conexões sempre criptografadas
- **Backups automáticos** - Diários e incrementais
- **Point-in-time restore** - Restaure para qualquer momento

---

## 🆘 Troubleshooting

### Erro: "Can't reach database server"

**Solução:** Verifique se copiou as credenciais corretas do Neon

### Erro: "Environment variable not found: DIRECT_URL"

**Solução:** Adicione `DIRECT_URL` no arquivo `.env`

### Erro ao executar migrations

**Solução:**

```powershell
# Limpar e tentar novamente
npx prisma generate
npx prisma migrate deploy
```

### Banco vazio após migration

**Solução:** Execute o seed:

```powershell
npx prisma db seed
```

---

## 📞 Suporte

- **Neon Docs:** https://neon.tech/docs
- **Neon Discord:** https://discord.gg/neon
- **Neon Status:** https://neonstatus.com

---

## 🎯 Próximos Passos

Agora que você está no Neon:

1. ✅ **Teste tudo** localmente
2. ✅ **Faça deploy** na Vercel (se ainda não fez)
3. ✅ **Crie um branch** de desenvolvimento no Neon (opcional)
4. ✅ **Configure backups** automáticos (já vem ativado)

---

🎉 **Parabéns! Você está no Neon agora!**

Aproveite a velocidade e confiabilidade! 🚀
