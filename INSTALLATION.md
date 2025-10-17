# 🚀 GUIA DE INSTALAÇÃO E CONFIGURAÇÃO

## Passo 1: Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```powershell
npm install
```

Isso instalará todas as dependências necessárias:

- Next.js, React, TypeScript
- TailwindCSS
- Prisma
- NextAuth.js
- Zod, Zustand, React Hook Form
- Recharts, Framer Motion, Lucide React
- E todas as outras bibliotecas

---

## Passo 2: Configurar Banco de Dados

### Opção A: Neon PostgreSQL (Cloud - Recomendado)

1. **Crie uma conta gratuita em [neon.tech](https://neon.tech)**

2. **Crie um novo projeto**

   - Nome: `finacassss` ou o que preferir
   - Região: Escolha a mais próxima (us-east-1, eu-west-3, etc)

3. **Copie a Connection String**

   - No dashboard, copie a string de conexão que aparece
   - Exemplo: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb`

4. **Configure o .env**

   ```powershell
   # Crie o arquivo .env
   Copy-Item .env.example .env
   ```

5. **Edite o `.env` e cole sua connection string:**
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

### Opção B: PostgreSQL Local

1. **Instale o PostgreSQL**

   - Baixe em: https://www.postgresql.org/download/windows/
   - Durante instalação, defina senha para usuário `postgres`
   - Anote a senha!

2. **Crie o banco de dados**

   ```powershell
   # Abra o psql (SQL Shell)
   # Logue com usuário postgres e a senha que você definiu
   CREATE DATABASE finacassss;
   ```

3. **Configure o .env**

   ```powershell
   Copy-Item .env.example .env
   ```

4. **Edite o `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/finacassss?schema=public"
   ```

---

## Passo 3: Configurar NextAuth Secret

1. **Gere um secret aleatório**

   No PowerShell:

   ```powershell
   # Opção 1: Usando .NET (já vem no Windows)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

   Ou simplesmente use qualquer string aleatória longa:

   ```
   minha-super-secret-key-aleatoria-12345-abcdef
   ```

2. **Adicione ao `.env`:**
   ```env
   NEXTAUTH_SECRET="cole-o-secret-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

---

## Passo 4: Configurar Google OAuth (OPCIONAL)

Se quiser login com Google:

1. **Acesse [Google Cloud Console](https://console.cloud.google.com/)**

2. **Crie um novo projeto** ou selecione existente

3. **Ative a Google+ API**

   - Menu lateral > APIs & Services > Library
   - Busque por "Google+ API" e ative

4. **Configure o OAuth Consent Screen**

   - Menu lateral > APIs & Services > OAuth consent screen
   - User Type: External
   - App name: Finaçassss
   - User support email: seu-email@gmail.com
   - Developer contact: seu-email@gmail.com
   - Save and Continue

5. **Crie as credenciais**

   - Menu lateral > APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Name: Finaçassss Web
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Create

6. **Copie Client ID e Client Secret**

7. **Adicione ao `.env`:**
   ```env
   GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="seu-client-secret"
   ```

**Se NÃO quiser Google OAuth**, deixe essas linhas em branco ou remova-as do `.env`.

---

## Passo 5: Inicializar o Banco de Dados

```powershell
# Gera o Prisma Client
npm run db:generate

# Aplica o schema ao banco (cria as tabelas)
npm run db:push
```

Você deve ver mensagens de sucesso indicando que as tabelas foram criadas.

---

## Passo 6: Iniciar o Servidor

```powershell
npm run dev
```

Aguarde a mensagem:

```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## Passo 7: Acessar a Aplicação

1. **Abra o navegador em:** `http://localhost:3000`

2. **Você será redirecionado para** `/auth/login`

3. **Clique em "Criar conta"** e registre-se

4. **Faça login** e comece a usar!

---

## 📋 Seu arquivo .env deve ficar assim:

```env
# Database (Neon ou Local)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui-muito-longo-e-aleatorio"

# Google OAuth (opcional - deixe em branco se não for usar)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## ✅ Checklist de Instalação

- [ ] `npm install` executado sem erros
- [ ] Arquivo `.env` criado e configurado
- [ ] `DATABASE_URL` configurado (Neon ou Local)
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `npm run db:generate` executado com sucesso
- [ ] `npm run db:push` executado com sucesso
- [ ] `npm run dev` rodando sem erros
- [ ] Consegue acessar `http://localhost:3000`
- [ ] Consegue criar uma conta
- [ ] Consegue fazer login

---

## 🐛 Problemas Comuns

### Erro: "Can't reach database server"

- ✅ PostgreSQL está rodando? (se local)
- ✅ Connection string está correta?
- ✅ Senha está correta?
- ✅ Porta 5432 está aberta?

### Erro: "Invalid `prisma.user.create()` invocation"

- ✅ Rodou `npm run db:push`?
- ✅ Tabelas foram criadas no banco?
- ✅ Rode `npm run db:studio` para visualizar o banco

### Erro: "NextAuth configuration error"

- ✅ `NEXTAUTH_SECRET` está definido?
- ✅ `NEXTAUTH_URL` está correto?
- ✅ Reiniciou o servidor após mudar o `.env`?

### Erro ao fazer login com Google

- ✅ `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` corretos?
- ✅ Redirect URI configurado no Google Console?
- ✅ OAuth Consent Screen configurado?

### Página em branco ou erro 500

- ✅ Veja o console do navegador (F12)
- ✅ Veja o terminal onde rodou `npm run dev`
- ✅ Tente deletar `.next` e rodar `npm run dev` novamente

---

## 🔧 Comandos Úteis

```powershell
# Ver o banco de dados visualmente
npm run db:studio

# Recriar o banco (ATENÇÃO: apaga todos os dados)
npm run db:push -- --force-reset

# Build para produção
npm run build

# Rodar em produção
npm run start

# Verificar erros de lint
npm run lint
```

---

## 🎉 Pronto!

Sua aplicação de controle financeiro está rodando!

Próximos passos:

1. Explore as páginas de autenticação
2. Crie algumas categorias
3. Adicione transações de teste
4. Personalize o tema (light/dark)

Para desenvolvimento futuro, consulte o arquivo `DEVELOPMENT.md`.

---

**Alguma dúvida?** Verifique o `README.md` ou os arquivos de documentação.
