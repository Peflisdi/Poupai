# ⚡ QUICK START - COMECE AQUI!

## 🎯 O que fazer AGORA para o projeto funcionar:

### **PASSO 1: Configurar Banco de Dados** ⏱️ 5 minutos

#### Opção Mais Rápida: **Supabase** (RECOMENDADO!)

1. **Acesse**: https://supabase.com
2. **Crie conta grátis** (pode usar GitHub)
3. **New Project**:
   - Name: `finacassss`
   - Database Password: Anote essa senha!
   - Region: Escolha a mais próxima
4. **Aguarde 2 minutos** (criação do projeto)
5. **Copie a Connection String**:
   - Settings → Database → Connection string → URI
   - Copie a string que começa com `postgresql://`

---

### **PASSO 2: Criar arquivo .env** ⏱️ 1 minuto

Na raiz do projeto (`C:\Projects\Finaçassss\`), crie o arquivo `.env`:

```env
# Cole a connection string do Supabase aqui
DATABASE_URL="postgresql://postgres.[SEU-ID]:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Gere um secret aleatório (qualquer string grande)
NEXTAUTH_SECRET="finacassss-super-secret-key-123456789"

# URL do seu app
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Opcional - deixe vazio por enquanto)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**IMPORTANTE**: Substitua `[SEU-ID]` e `[SUA-SENHA]` pelos valores da sua connection string do Supabase!

---

### **PASSO 3: Executar Migrações** ⏱️ 2 minutos

Abra o PowerShell na pasta do projeto:

```powershell
# Navegar para o projeto
cd C:\Projects\Finaçassss

# Executar migrações (cria as tabelas no banco)
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate
```

Se tudo der certo, você verá:

```
✔ Generated Prisma Client
```

---

### **PASSO 4: Iniciar o Servidor** ⏱️ 30 segundos

```powershell
npm run dev
```

Aguarde aparecer:

```
✓ Ready in X.Xs
- Local: http://localhost:3000
```

---

### **PASSO 5: Criar sua conta** ⏱️ 1 minuto

1. **Abra o navegador**: http://localhost:3000
2. **Clique em "Criar conta"** ou acesse: http://localhost:3000/register
3. **Preencha**:
   - Nome: `Seu Nome`
   - Email: `teste@exemplo.com`
   - Senha: `123456`
4. **Criar Conta**
5. **Fazer Login**
6. **Acessar Dashboard**: http://localhost:3000/dashboard

---

## ✅ **PRONTO!** Seu dashboard deve estar funcionando!

---

## 🎊 **Próximos Passos (Depois que funcionar):**

### Para popular com dados de teste:

```powershell
# (Opcional) Adicionar dados de exemplo
npx prisma studio
```

Isso abre uma interface visual em `http://localhost:5555` onde você pode:

- Ver as tabelas criadas
- Adicionar categorias manualmente
- Adicionar transações de teste

### Para entender o projeto:

1. Leia: `README.md` - Overview geral
2. Leia: `PROJECT_COMPLETE.md` - Tudo que foi feito
3. Explore: `DATABASE_SETUP.md` - Opções avançadas de DB

---

## 🐛 **Problemas? Soluções Rápidas:**

### ❌ Erro: "Can't reach database server"

**Causa**: DATABASE_URL errado no .env
**Solução**: Verifique se copiou a connection string correta do Supabase

### ❌ Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Arquivo .env não existe ou está no lugar errado
**Solução**: Crie o arquivo .env na raiz do projeto (junto com package.json)

### ❌ Erro: "Command failed: prisma"

**Causa**: Dependências não instaladas
**Solução**: Execute `npm install` primeiro

### ❌ Erro: "Port 3000 already in use"

**Causa**: Outra aplicação usando a porta
**Solução**: O Next.js vai usar porta 3001 automaticamente (acesse localhost:3001)

### ❌ Dashboard vazio ou erro 401

**Causa**: Você não está logado
**Solução**:

1. Acesse /login
2. Faça login com a conta que você criou
3. Acesse /dashboard novamente

### ❌ Erro: "Invalid `prisma.user.create()`"

**Causa**: Migrations não foram executadas
**Solução**: Execute `npx prisma migrate dev --name init`

---

## 📞 **Ainda com problemas?**

1. **Verifique o terminal** onde está rodando `npm run dev` - vai mostrar erros detalhados
2. **Abra o console do navegador** (F12) - vai mostrar erros do frontend
3. **Teste a conexão do banco**: `npx prisma studio` - deve abrir sem erros
4. **Limpe e reinstale**:
   ```powershell
   rm -rf node_modules
   rm -rf .next
   npm install
   npm run dev
   ```

---

## ⏱️ **TEMPO TOTAL: ~10 minutos**

- Supabase: 5 min
- .env: 1 min
- Migrações: 2 min
- Servidor: 30 seg
- Conta: 1 min
- **TOTAL**: 9 minutos e 30 segundos

---

## 🎯 **RESUMO EM 5 COMANDOS:**

```powershell
# 1. Crie .env com DATABASE_URL do Supabase

# 2. Execute:
cd C:\Projects\Finaçassss

# 3. Migrations
npx prisma migrate dev --name init

# 4. Generate
npx prisma generate

# 5. Start
npm run dev
```

**Acesse**: http://localhost:3000 → Registre → Login → Dashboard

---

**✨ BOA SORTE! Seu projeto vai funcionar! ✨**
