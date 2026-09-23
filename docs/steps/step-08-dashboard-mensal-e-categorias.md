# Step 08: Dashboard Mensal e Breakdown de Categorias

## 🎯 Objetivo
Implementar a navegação temporal de despesas mês a mês e a visão analítica de gastos categorizados, eliminando a sobrecarga de visualização de todas as transações de uma vez e oferecendo inteligência visual para o usuário.

---

## 🛠️ Implementações Realizadas

### 1. Back-end: Filtragem por Mês e Ano no Drizzle ORM
- **`apps/api/src/services/expense.service.ts`**:
  - Adicionada a tipagem `ExpenseFilters` contendo `month` e `year`.
  - Construção dinâmica de intervalo temporal (`gte(expenses.expense_date, startDate)` e `lte(expenses.expense_date, endDate)`), calculando com precisão o primeiro e último dia do mês selecionado.
  - Ordenação decrescente por data (`desc(expenses.expense_date)`).
- **`apps/api/src/controllers/expense.controller.ts`**:
  - Extração e validação dos query params `month` e `year` na rota `GET /expenses`.

### 2. Front-end: Estado Temporal e Agrupamento Analítico
- **`apps/web/src/types/expense.ts`**:
  - Criada a interface `CategoryTotal` (`category`, `total`, `percentage`, `count`).
- **`apps/web/src/hooks/useExpenses.ts`**:
  - Estado de navegação temporal: `selectedMonth` (1 a 12) e `selectedYear` inicializados no mês atual.
  - Funções de controle: `goToPreviousMonth()`, `goToNextMonth()`, `goToCurrentMonth()`.
  - Atualização automática do fetch da API com base na mudança de mês/ano.
  - Cálculo memoizado (`useMemo`) do `categoryBreakdown`, agrupando despesas por categoria, somando totais e calculando o percentual de cada categoria sobre o total gasto no mês.

### 3. Front-end: Componentes Visuais (Dark Glassmorphism)
- **`apps/web/src/components/dashboard/MonthNavigator.tsx`**:
  - Navegador táctil com botões `‹` e `›`.
  - Exibição de mês e ano por extenso em português.
  - Botão inteligente "Hoje" exibido condicionalmente para retorno rápido ao mês corrente.
- **`apps/web/src/components/dashboard/CategoryBreakdown.tsx`**:
  - Card analítico com barras de progresso dinâmicas.
  - Paleta de cores semântica mapeada para categorias frequentes (Alimentação, Moradia, Transporte, etc.).
  - Exibição de quantidade de itens, valor total formatado em R$ e badge de percentual.
- **`apps/web/src/app/dashboard/page.tsx`**:
  - Integração modular do `MonthNavigator` e `CategoryBreakdown` mantendo o padrão mobile-first clean.

---

## 🚀 Próximos Passos
- Integração de serviço real de envio de e-mails (ex: Resend) para substituir o Ethereal em produção.
