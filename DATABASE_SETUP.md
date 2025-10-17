# 🗄️ Guia de Configuração do Banco de Dados

## Opção 1: PostgreSQL Local (Recomendado para Desenvolvimento)

### 1. Instalar PostgreSQL

- **Windows**: Download em https://www.postgresql.org/download/windows/
- Durante a instalação, anote a senha do usuário `postgres`

### 2. Configurar variável de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/finacassss?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Criar o banco de dados

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE finacassss;

# Sair
\q
```

### 4. Executar as migrações

```powershell
cd C:\Projects\Finaçassss
npx prisma migrate dev --name init
```

### 5. Gerar o Prisma Client

```powershell
npx prisma generate
```

### 6. (Opcional) Seed de dados de teste

Crie o arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Usuário Teste",
      email: "teste@exemplo.com",
      password: hashedPassword,
    },
  });

  // Criar categorias padrão
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Alimentação",
        icon: "🍔",
        color: "#EF4444",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Transporte",
        icon: "🚗",
        color: "#3B82F6",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Moradia",
        icon: "🏠",
        color: "#10B981",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Lazer",
        icon: "🎮",
        color: "#8B5CF6",
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: "Salário",
        icon: "💰",
        color: "#10B981",
      },
    }),
  ]);

  // Criar transações de exemplo
  const now = new Date();
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INCOME",
        description: "Salário",
        amount: 5000,
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        categoryId: categories[4].id,
        paymentMethod: "PIX",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        description: "Aluguel",
        amount: 1200,
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        categoryId: categories[2].id,
        paymentMethod: "DEBIT",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        description: "Supermercado",
        amount: 350,
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        categoryId: categories[0].id,
        paymentMethod: "CREDIT",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        description: "Uber",
        amount: 45,
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        categoryId: categories[1].id,
        paymentMethod: "PIX",
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        description: "Cinema",
        amount: 80,
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        categoryId: categories[3].id,
        paymentMethod: "DEBIT",
      },
    }),
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("📧 Email de teste: teste@exemplo.com");
  console.log("🔑 Senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Adicione ao `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Instale ts-node:

```powershell
npm install -D ts-node
```

Execute o seed:

```powershell
npx prisma db seed
```

---

## Opção 2: PostgreSQL com Docker

### 1. Criar docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: finacassss-db
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: finacassss
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 2. Iniciar o container

```powershell
docker-compose up -d
```

### 3. Configure o .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finacassss?schema=public"
```

### 4. Execute as migrações

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

---

## Opção 3: Vercel Postgres (Produção)

### 1. Criar projeto no Vercel

- Acesse https://vercel.com
- Crie um novo projeto

### 2. Adicionar Postgres

- Na dashboard do projeto, vá em "Storage"
- Clique em "Create Database"
- Selecione "Postgres"
- Copie as variáveis de ambiente

### 3. Configurar variáveis de ambiente

Adicione as variáveis no Vercel e no seu `.env.local`

### 4. Deploy

```powershell
npm run build
vercel --prod
```

---

## Opção 4: Supabase (Free Tier Generoso)

### 1. Criar projeto no Supabase

- Acesse https://supabase.com
- Crie um novo projeto

### 2. Copiar connection string

- Vá em Settings > Database
- Copie a "Connection string"

### 3. Configure o .env

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 4. Execute as migrações

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🔍 Verificar Conexão

### Prisma Studio (UI Visual)

```powershell
npx prisma studio
```

Abre em: http://localhost:5555

### Verificar tabelas criadas

```powershell
npx prisma migrate status
```

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

- Verifique se o PostgreSQL está rodando
- Confirme o usuário, senha e porta no DATABASE_URL
- Teste a conexão: `psql -U postgres -h localhost`

### Erro: "Database does not exist"

- Execute: `CREATE DATABASE finacassss;` no psql

### Erro: "Migration failed"

- Apague o banco e recrie: `DROP DATABASE finacassss; CREATE DATABASE finacassss;`
- Execute novamente: `npx prisma migrate dev`

### Erro: "Prisma Client not generated"

- Execute: `npx prisma generate`

---

## 📝 Comandos Úteis

```powershell
# Ver status das migrações
npx prisma migrate status

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Resetar banco de dados (cuidado!)
npx prisma migrate reset

# Aplicar migrações em produção
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Formatar schema.prisma
npx prisma format

# Validar schema.prisma
npx prisma validate
```

---

## ✅ Checklist de Configuração

- [ ] PostgreSQL instalado/configurado
- [ ] Arquivo .env criado com DATABASE_URL
- [ ] `npx prisma migrate dev` executado com sucesso
- [ ] `npx prisma generate` executado
- [ ] (Opcional) Seed de dados executado
- [ ] Prisma Studio aberto e funcionando
- [ ] Servidor Next.js rodando sem erros
- [ ] Login/registro funcionando
- [ ] Dashboard carregando (mesmo vazio)

---

**Pronto!** Seu banco de dados está configurado e pronto para uso! 🎉
