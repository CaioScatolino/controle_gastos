import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { ExpenseItem, NewExpensePayload, CategoryTotal } from "@/types/expense";

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Controle do Mês e Ano selecionados (Inicia na data atual)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1 a 12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // 2. Busca apenas as despesas do mês e ano selecionados
  const loadExpenses = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<ExpenseItem[]>(
        `/expenses?month=${selectedMonth}&year=${selectedYear}`,
      );
      if (res.error) {
        setError(res.error);
      } else if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar despesas");
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setLoading(true);
    loadExpenses().finally(() => setLoading(false));
  }, [loadExpenses]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  // 3. Ações de Navegação Temporal (Mês Anterior e Próximo)
  const goToPreviousMonth = useCallback(() => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 1) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 12;
      }
      return prevMonth - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 12) {
        setSelectedYear((prevYear) => prevYear + 1);
        return 1;
      }
      return prevMonth + 1;
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  // 4. Criação e exclusão de despesa
  const createExpense = useCallback(
    async (data: Omit<NewExpensePayload, "user_id">) => {
      const user = authStorage.getUser();
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      const payload: NewExpensePayload = {
        ...data,
        user_id: user.id,
      };

      const res = await apiFetch("/expenses/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.error) {
        return { success: false, error: res.error };
      }

      await loadExpenses();
      return { success: true };
    },
    [loadExpenses],
  );

  const deleteExpense = useCallback(async (id: number) => {
    const res = await apiFetch(`/expenses/${id}/status`, {
      method: "PATCH",
    });

    if (res.error) {
      return { success: false, error: res.error };
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  }, []);

  // 5. Cálculos Financeiros do Mês Selecionado
  const { totalReceitas, totalDespesas, saldoLiquido } = useMemo(() => {
    const receitas = expenses
      .filter((e) => e.type === "Receita")
      .reduce((acc, curr) => acc + parseFloat(curr.value || "0"), 0);

    const despesas = expenses
      .filter((e) => e.type === "Despesa")
      .reduce((acc, curr) => acc + parseFloat(curr.value || "0"), 0);

    return {
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldoLiquido: receitas - despesas,
    };
  }, [expenses]);

  // 6. Agrupamento de Gastos por Categoria (para o gráfico/barras do mês)
  const categoryBreakdown = useMemo<CategoryTotal[]>(() => {
    const despesas = expenses.filter((e) => e.type === "Despesa");
    const totalGasto = despesas.reduce(
      (acc, curr) => acc + parseFloat(curr.value || "0"),
      0,
    );

    if (totalGasto === 0) return [];

    const map = new Map<string, { total: number; count: number }>();

    for (const item of despesas) {
      const val = parseFloat(item.value || "0");
      const current = map.get(item.category) || { total: 0, count: 0 };
      map.set(item.category, {
        total: current.total + val,
        count: current.count + 1,
      });
    }

    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: Math.round((data.total / totalGasto) * 100),
      }))
      .sort((a, b) => b.total - a.total); // Ordena da categoria com maior gasto para a menor
  }, [expenses]);

  return {
    expenses,
    loading,
    refreshing,
    error,
    selectedMonth,
    selectedYear,
    totalReceitas,
    totalDespesas,
    saldoLiquido,
    categoryBreakdown,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    refresh,
    createExpense,
    deleteExpense,
  };
}
