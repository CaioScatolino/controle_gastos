import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { ExpenseItem, NewExpensePayload } from "@/types/expense";

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<ExpenseItem[]>("/expenses");
      if (res.error) {
        setError(res.error);
      } else if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar despesas");
    }
  }, []);

  useEffect(() => {
    loadExpenses().finally(() => setLoading(false));
  }, [loadExpenses]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

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
    [loadExpenses]
  );

  const deleteExpense = useCallback(
    async (id: number) => {
      const res = await apiFetch(`/expenses/${id}/status`, {
        method: "PATCH",
      });

      if (res.error) {
        return { success: false, error: res.error };
      }

      // Atualiza o estado local imediatamente para uma resposta ultrarrápida
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    },
    []
  );

  // Cálculos matemáticos memoizados para alta performance
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

  return {
    expenses,
    loading,
    refreshing,
    error,
    totalReceitas,
    totalDespesas,
    saldoLiquido,
    refresh,
    createExpense,
    deleteExpense,
  };
}
