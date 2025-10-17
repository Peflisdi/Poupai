# 🚀 ROADMAP DE DESENVOLVIMENTO

## ✅ FASE 1 - MVP (COMPLETO)

### Estrutura Base

- [x] Configuração do Next.js 14 com App Router
- [x] Configuração do TypeScript
- [x] Configuração do TailwindCSS com tema monocromático
- [x] Configuração do Prisma com PostgreSQL
- [x] Sistema de design minimalista (light/dark)

### Autenticação

- [x] NextAuth.js configurado
- [x] Login com email/senha
- [x] Login com Google OAuth
- [x] Página de registro
- [x] Página de login
- [x] Hash de senhas com bcryptjs

### Componentes UI Base

- [x] Button (primary, secondary, ghost, danger)
- [x] Input (com label, erro, helper text)
- [x] Card (com header, title, description, content)
- [x] Theme Provider (light/dark toggle)
- [x] Providers wrapper (Session + Theme)

### Banco de Dados

- [x] Schema completo do Prisma
- [x] Modelos: User, Account, Session, Category, Transaction, Card, Goal, InstallmentPurchase
- [x] Relacionamentos configurados
- [x] Categorias padrão criadas no registro

---

## 🚧 FASE 2 - DASHBOARD E FUNCIONALIDADES CORE (PRÓXIMA)

### Layout Principal

- [ ] Sidebar com navegação
- [ ] Header com user menu e theme toggle
- [ ] Layout responsivo para mobile
- [ ] Breadcrumbs
- [ ] Loading states

### Dashboard (Página Principal)

- [ ] Componente de resumo financeiro
  - [ ] Saldo atual
  - [ ] Total de gastos do mês
  - [ ] Total de receitas do mês
  - [ ] Percentual do orçamento
- [ ] Gráfico de pizza por categoria (Recharts)
- [ ] Linha do tempo de gastos (últimos 7/30/90 dias)
- [ ] Lista de últimas transações
- [ ] Cards de alertas (vencimentos, limites)

### Transações

- [ ] Lista de transações com filtros
  - [ ] Filtro por período
  - [ ] Filtro por categoria
  - [ ] Filtro por tipo (receita/despesa)
  - [ ] Filtro por forma de pagamento
  - [ ] Busca por descrição
- [ ] Modal de adicionar transação
- [ ] Modal de editar transação
- [ ] Confirmação de exclusão
- [ ] Suporte a anexos (upload de comprovantes)
- [ ] Tags personalizadas
- [ ] Transações recorrentes

### Categorias

- [ ] Lista de categorias (padrão + customizadas)
- [ ] Modal de criar categoria
  - [ ] Nome
  - [ ] Ícone (seletor de ícones)
  - [ ] Cor (color picker monocromático)
  - [ ] Meta de gastos
- [ ] Modal de editar categoria
- [ ] Subcategorias
- [ ] Alertas de meta (80%, 90%, 100%)
- [ ] Visualização de progresso da meta

### Cartões de Crédito

- [ ] Lista de cartões
- [ ] Card visual para cada cartão
  - [ ] Nome/apelido
  - [ ] Limite total e disponível
  - [ ] Barra de progresso do limite
  - [ ] Gastos do mês
  - [ ] Próximos vencimentos
- [ ] Modal de adicionar cartão
- [ ] Modal de editar cartão
- [ ] Visualização de fatura
  - [ ] Fatura atual
  - [ ] Fatura futura
  - [ ] Histórico de faturas
- [ ] Sistema de alertas
  - [ ] Aproximação do limite (80%, 90%)
  - [ ] Data de vencimento próxima
  - [ ] Fatura acima da média

### Objetivos (Cofrinhos)

- [ ] Lista de objetivos
- [ ] Card visual para cada objetivo
  - [ ] Nome
  - [ ] Valor da meta
  - [ ] Valor atual
  - [ ] Barra de progresso
  - [ ] Prazo (se definido)
- [ ] Modal de criar objetivo
- [ ] Modal de adicionar valor ao objetivo
- [ ] Modal de editar objetivo
- [ ] Histórico de depósitos
- [ ] Sugestões de quanto guardar por mês

### Compras Parceladas

- [ ] Lista de compras parceladas
- [ ] Card visual para cada compra
  - [ ] Descrição
  - [ ] Valor total
  - [ ] Parcelas (pagas/total)
  - [ ] Valor da parcela
  - [ ] Cartão vinculado
  - [ ] Progresso visual
- [ ] Modal de criar compra parcelada
- [ ] Visualização no calendário
- [ ] Impacto nas faturas futuras
- [ ] Opção de antecipação

---

## 📊 FASE 3 - RELATÓRIOS E ANÁLISES

### Relatórios

- [ ] Página de relatórios
- [ ] Relatório mensal
  - [ ] Comparativo com mês anterior
  - [ ] Gastos por categoria
  - [ ] Receitas vs despesas
- [ ] Relatório anual
  - [ ] Evolução mensal
  - [ ] Média de gastos
  - [ ] Categorias mais gastas
- [ ] Gráfico de evolução patrimonial
- [ ] Gráfico de tendências
- [ ] Projeções financeiras

### Exportação de Dados

- [ ] Exportar para CSV
- [ ] Exportar para Excel
- [ ] Exportar para PDF
- [ ] Backup completo (JSON)
- [ ] Importação de dados
- [ ] Importação de extratos CSV

### Configurações

- [ ] Página de configurações
- [ ] Editar perfil
  - [ ] Nome
  - [ ] Email
  - [ ] Foto (upload)
- [ ] Alterar senha
- [ ] Preferências
  - [ ] Moeda (R$, US$, etc)
  - [ ] Primeiro dia do mês
  - [ ] Formato de data
- [ ] Notificações
  - [ ] Email de resumo mensal
  - [ ] Alertas de vencimento
  - [ ] Alertas de limite
- [ ] Exportar/Importar dados
- [ ] Excluir conta

---

## 🤖 FASE 4 - ASSISTENTE INTELIGENTE (FUTURO)

### Chat Bot

- [ ] Interface de chat
- [ ] Registro de transações por texto
  - [ ] "Gastei R$45 no supermercado"
  - [ ] Detecção automática de categoria
  - [ ] Confirmação antes de salvar
- [ ] Perguntas sobre finanças
  - [ ] "Quanto gastei em alimentação esse mês?"
  - [ ] "Qual meu saldo atual?"

### Análises e Insights

- [ ] Detecção de padrões de gasto
- [ ] Comparativos automáticos
- [ ] Alertas inteligentes
  - [ ] "Você gastou 30% a mais em X"
  - [ ] "Gastos incomuns detectados"
- [ ] Sugestões de economia
- [ ] Previsão de atingimento de metas

### Lembretes Inteligentes

- [ ] Contas fixas a vencer
- [ ] Metas não atingidas
- [ ] Sugestões de ajustes no orçamento

---

## 📱 FASE 5 - MOBILE APP (FUTURO)

### React Native

- [ ] Setup do React Native com Expo
- [ ] Compartilhamento de API com web
- [ ] Mesma identidade visual
- [ ] Notificações push
- [ ] Biometria para login
- [ ] Scan de QR Code para pagamentos
- [ ] OCR para extrair dados de notas fiscais

---

## 🔧 MELHORIAS TÉCNICAS CONTÍNUAS

### Performance

- [ ] Lazy loading de componentes
- [ ] Otimização de imagens
- [ ] Cache de queries
- [ ] Server-side rendering otimizado
- [ ] Compressão de assets

### Testes

- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Testes E2E (Playwright)
- [ ] Coverage mínimo de 80%

### Segurança

- [ ] Rate limiting em APIs
- [ ] Validação de inputs (Zod)
- [ ] Sanitização de dados
- [ ] CORS configurado
- [ ] Headers de segurança

### DevOps

- [ ] CI/CD com GitHub Actions
- [ ] Testes automatizados no PR
- [ ] Deploy automático para staging
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (opcional)

---

## 📝 BACKLOG DE IDEIAS

- [ ] Integração com Open Banking
- [ ] Compartilhamento de despesas (dividir conta)
- [ ] Modo família (múltiplos usuários)
- [ ] Gamificação (badges, conquistas)
- [ ] Comparativo com outros usuários (anônimo)
- [ ] Widget para área de trabalho
- [ ] Extensão para navegador
- [ ] Integração com assistentes de voz
- [ ] Modo offline com sync

---

## 🎯 PRIORIDADES IMEDIATAS

1. **Sidebar e Layout principal** (componentes)
2. **Dashboard completo** (página + gráficos)
3. **CRUD de Transações** (completo com filtros)
4. **CRUD de Categorias** (com ícones e cores)
5. **CRUD de Cartões** (com visualização de fatura)
6. **CRUD de Objetivos** (com progresso visual)
7. **Sistema de Compras Parceladas**
8. **Página de Relatórios** (básica)
9. **Configurações de usuário**
10. **Testes e refinamentos**

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ Tempo de carregamento < 2s
- ✅ Lighthouse score > 90
- ✅ 100% responsivo (mobile-first)
- ✅ Acessibilidade (WCAG 2.1)
- ✅ Zero erros de console
- ✅ TypeScript strict mode
- ✅ Documentação completa

---

**Última atualização**: 15/10/2025
