# ⚡ QUICK START - Comandos Rápidos

## 🚀 Instalação Rápida (5 minutos)

```powershell
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
Copy-Item .env.example .env

# 3. Editar .env com suas credenciais
# (Use um editor de texto para abrir .env)

# 4. Gerar Prisma Client
npm run db:generate

# 5. Criar tabelas no banco
npm run db:push

# 6. Iniciar servidor
npm run dev

# ✅ Pronto! Acesse: http://localhost:3000
```

---

## 📝 Arquivo .env Mínimo

```env
# Copie e cole isto no seu .env (ajuste os valores)

# Banco de Dados (Neon ou Local)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cole-aqui-uma-string-aleatoria-bem-longa"

# Google OAuth (opcional - deixe vazio se não for usar)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 🔧 Comandos Mais Usados

### Desenvolvimento

```powershell
npm run dev              # Iniciar servidor (localhost:3000)
npm run build            # Build de produção
npm run start            # Rodar build de produção
npm run lint             # Verificar erros de código
```

### Banco de Dados

```powershell
npm run db:generate      # Gerar Prisma Client (após mudar schema)
npm run db:push          # Aplicar schema ao banco (criar/atualizar tabelas)
npm run db:studio        # Abrir interface visual do banco
```

### Limpeza

```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run db:generate
npm run dev

# Resetar banco (⚠️ APAGA TODOS OS DADOS!)
npm run db:push -- --force-reset
```

---

## 🗄️ Comandos do Banco (PostgreSQL Local)

### Acessar o banco via psql

```powershell
# Abrir SQL Shell (psql)
psql -U postgres -d finacassss
```

### Comandos úteis dentro do psql

```sql
-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d "User"

-- Ver todos os usuários
SELECT * FROM "User";

-- Contar transações
SELECT COUNT(*) FROM "Transaction";

-- Ver últimas transações
SELECT * FROM "Transaction" ORDER BY date DESC LIMIT 10;

-- Sair do psql
\q
```

---

## 🐛 Solução Rápida de Problemas

### Erro de conexão com banco

```powershell
# 1. Verificar se PostgreSQL está rodando
Get-Service -Name postgresql*

# 2. Testar conexão manualmente
psql -U postgres -d finacassss

# 3. Verificar .env
# DATABASE_URL está correto?
# Senha está certa?
```

### Erro no Prisma

```powershell
# Regenerar tudo
npm run db:generate
npm run db:push
```

### Página em branco ou erro 500

```powershell
# Limpar cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Erro de autenticação

```powershell
# Verificar NEXTAUTH_SECRET no .env
# Limpar cookies do navegador (Ctrl+Shift+Delete)
# Reiniciar servidor (Ctrl+C e npm run dev)
```

---

## 📊 Prisma Studio (Visualizar Banco)

```powershell
# Abrir interface visual
npm run db:studio

# Acesse: http://localhost:5555
```

Você pode:

- Ver todos os dados
- Criar registros manualmente
- Editar dados
- Deletar registros
- Ver relacionamentos

---

## 🎨 Atalhos do VS Code (Recomendados)

```
Ctrl + `          - Abrir/fechar terminal
Ctrl + Shift + P  - Paleta de comandos
Ctrl + P          - Buscar arquivo
Ctrl + B          - Toggle sidebar
Ctrl + /          - Comentar linha
Alt + Shift + F   - Formatar documento
F2                - Renomear símbolo
Ctrl + D          - Selecionar próxima ocorrência
```

---

## 🧹 Limpeza Completa (Se algo der errado)

```powershell
# 1. Parar o servidor (Ctrl+C no terminal)

# 2. Deletar tudo
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force .env

# 3. Reinstalar
npm install

# 4. Recriar .env
Copy-Item .env.example .env
# (Edite o .env com suas credenciais)

# 5. Resetar banco
npm run db:generate
npm run db:push

# 6. Iniciar
npm run dev
```

---

## 🚀 Deploy Rápido (Vercel)

### Via CLI

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Deploy de produção
vercel --prod
```

### Via Dashboard

1. Push para GitHub
2. Acesse vercel.com
3. Import repository
4. Adicione variáveis de ambiente
5. Deploy!

---

## 📦 Variáveis de Ambiente (Produção)

No Vercel/Railway/etc, adicione:

```
DATABASE_URL=sua-connection-string-postgresql
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu-secret-de-producao
GOOGLE_CLIENT_ID=seu-client-id (opcional)
GOOGLE_CLIENT_SECRET=seu-client-secret (opcional)
```

⚠️ **Importante**:

- Use um banco PostgreSQL online (Neon, Supabase, Railway)
- Gere um novo NEXTAUTH_SECRET para produção
- Configure redirect URIs no Google OAuth com seu domínio de produção

---

## 🔐 Gerar NEXTAUTH_SECRET

### Método 1: PowerShell (Windows)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Método 2: Online

Acesse: https://generate-secret.vercel.app/32

### Método 3: Simples

Use qualquer string aleatória longa:

```
minha-chave-super-secreta-12345-abcdef-ghijkl-mnopqr
```

---

## 📱 Testar em Diferentes Dispositivos

```powershell
# Ver IP local
ipconfig

# Procure por "IPv4 Address" (ex: 192.168.1.100)

# Acessar de outro dispositivo na mesma rede:
http://192.168.1.100:3000
```

⚠️ Configure `NEXTAUTH_URL` temporariamente para funcionar em rede local.

---

## 🎯 Checklist Antes de Começar a Desenvolver

- [ ] `npm install` concluído
- [ ] `.env` configurado
- [ ] Banco de dados conectado
- [ ] `npm run db:push` executado
- [ ] `npm run dev` rodando
- [ ] Consegue acessar `localhost:3000`
- [ ] Consegue criar conta e fazer login
- [ ] Prisma Studio funciona (`npm run db:studio`)

---

## 📚 Links Úteis

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Lucide Icons**: https://lucide.dev
- **Neon (Database)**: https://neon.tech
- **Vercel (Deploy)**: https://vercel.com

---

## 🎨 Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Para instalar:

1. Abra VS Code
2. Ctrl + Shift + X
3. Busque e instale:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Prisma

---

## 💡 Dicas Rápidas

### Hot Reload não funciona?

```powershell
# Reinicie o servidor
# Ctrl+C e depois npm run dev
```

### Mudou o schema.prisma?

```powershell
npm run db:generate
npm run db:push
```

### Mudou o .env?

```powershell
# Reinicie o servidor (Next.js não recarrega .env automaticamente)
```

### Erro de TypeScript?

```powershell
# Rode o linter
npm run lint

# Ou ignore temporariamente com:
// @ts-ignore
```

### Erro de importação?

```powershell
# Verifique o alias @/ no tsconfig.json
# Deve apontar para ./src/*
```

---

## 🎉 Pronto para Desenvolver!

Agora que está tudo configurado:

1. **Leia o** `DEVELOPMENT.md` **para ver o roadmap**
2. **Consulte o** `ARCHITECTURE.md` **para entender a estrutura**
3. **Comece criando os componentes do Dashboard**

**Boa sorte no desenvolvimento! 🚀**

---

> **Problemas?** Consulte `INSTALLATION.md` ou `README.md`
