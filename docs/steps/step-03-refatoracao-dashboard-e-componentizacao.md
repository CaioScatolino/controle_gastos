# Step 03: Refatoração da Dashboard e Arquitetura por Componentes

> **Data**: 16/09/2026  
> **Status**: Concluído com Sucesso  
> **Foco**: Desacoplamento da Dashboard monolítica em Custom Hook (`useExpenses`), centralização de tipos TypeScript e componentes especializados de apresentação.

---

## 1. O que estamos fazendo?

Transformamos o arquivo `apps/web/src/app/dashboard/page.tsx` (que possuía mais de 400 linhas acumulando estado, lógica e interface) em uma arquitetura modular baseada em três pilares:
1. **Tipagem Unificada (`src/types/expense.ts`)**: Modelos `ExpenseItem`, `ExpenseType` e `NewExpensePayload`.
2. **Camada de Regras e Dados (`src/hooks/useExpenses.ts`)**: Um Custom Hook reutilizável que gerencia chamadas à API, estados de loading, memoização dos cálculos financeiros (`saldoLiquido`, `totalReceitas`, `totalDespesas`) e ações (`createExpense`, `deleteExpense`).
3. **Componentes Especializados (`src/components/dashboard/`)**:
   - `DashboardHeader.tsx`: Avatar, dados do usuário logado, refresh e logout.
   - `BalanceCard.tsx`: Exibição visual de saldos e botão de ação rápida.
   - `TransactionList.tsx`: Gestão de loading, estado vazio e rolagem das transações.
   - `TransactionItem.tsx`: Linha individual de transação com ícone, categoria, data formatada e botão de exclusão.
   - `NewTransactionModal.tsx`: Modal interativo com formulário de cadastro, switch de tipo e validação.

---

## 2. Por que estamos escolhendo esta abordagem técnica e arquitetural?

### A. Princípio da Responsabilidade Única (SRP - Single Responsibility Principle)
- Uma página (`page.tsx`) deve apenas **orquestrar** o layout da rota. Ela não deve saber como fazer contas de subtração de despesas nem como desenhar o formulário de cada input.
- Com componentes pequenos e focados, você pode alterar o design de um card ou adicionar um novo gráfico sem medo de quebrar o formulário ou a listagem.

### B. Desacoplamento através de Custom Hooks (`useExpenses`)
- Ao mover as chamadas `fetch`, os `useState` e os `useMemo` para um hook, toda a lógica de finanças pode ser reutilizada em qualquer outra tela (como na tela de extrato completo `/expenses` ou em relatórios futuros).
- Permite escrever testes unitários para a lógica matemática de saldo de forma independente da interface gráfica.

### C. Integração Imediata do Soft Delete
- O novo `TransactionItem` já conta com botão de exclusão conectado ao método `deleteExpense` do hook, consumindo a rota `PATCH /api/expenses/:id/status` que acabamos de blindar no backend.

---

## 3. Qual é o impacto no restante do sistema?

- **Zero regressão visual**: A aparência, o dark mode, as cores de fintech e a experiência Mobile-First continuam idênticas para o usuário final.
- **Performance aprimorada**: O uso de `useMemo` garante que os totais financeiros não sejam recalculados em renders que não alteram a lista de despesas.
- **Facilidade para novas features**: O arquivo `dashboard/page.tsx` foi reduzido para cerca de **80 linhas**. Agora você tem total liberdade para plugar novos blocos (ex: cards de metas, resumos de cartão, filtros de mês) inserindo uma única linha de componente.

---

## 4. Guia de Execução e Testes Locais

Como os terminais do backend e frontend já estão em execução:

1. Acesse **`http://localhost:3000/dashboard`** no navegador.
2. A tela recarregará instantaneamente via Hot Module Replacement (HMR).
3. Teste as interações:
   - Clique em **Registrar Nova Transação** -> crie uma nova despesa ou receita e salve.
   - Passe o mouse sobre uma transação e clique no ícone da lixeira (🗑️): confirme a exclusão e veja o item desaparecer da lista com o saldo recalculado automaticamente em tempo real!
   - Clique no ícone de atualização (↻) no topo e veja o spin de refresh.
