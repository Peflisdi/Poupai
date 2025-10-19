# Debug Guide

## Problema 1: Busca não funciona

### Como testar:

1. Abra o console do navegador (F12)
2. Abra a busca (Cmd/Ctrl+K)
3. Digite "amazon"
4. Veja os logs no console

### O que verificar:

- Se aparece "Busca iniciada: { userId: ..., query: 'amazon' }"
- Se aparece "Transações encontradas: X"
- Se aparece "Resultados da busca: [...]"

### Possíveis problemas:

1. **Não há transações com "amazon"** - Criar uma transação com descrição "amazon" para testar
2. **Erro 401** - Problema de autenticação
3. **Erro 500** - Problema no banco de dados

## Problema 2: Erro ao criar compra parcelada

### Erro:

```
Foreign key constraint violated: `installment_purchases_userId_fkey (index)`
```

### Solução aplicada:

- Mudado de `userId: session.user.id` para `user: { connect: { id: session.user.id } }`
- Adicionado verificação se usuário existe antes de criar
- Usar Prisma transaction para garantir atomicidade

### Como testar:

1. Vá em Transações
2. Clique em "Nova Transação"
3. Preencha os dados
4. Marque "Compra Parcelada"
5. Defina 3 parcelas
6. Salve

### Verificar logs:

- "Criando compra parcelada para userId: ..."
- "Dados da compra parcelada: { ... }"
- Se aparecer "Usuário não encontrado" = problema na sessão

## Próximos passos:

1. Testar a busca com uma transação real
2. Testar criar compra parcelada
3. Verificar logs no terminal do servidor
