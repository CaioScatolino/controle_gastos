"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { apiFetch } from "@/lib/api";
import { authStorage, UserSession } from "@/lib/auth";
import {
  TrendingUp,
  TrendingDown,
  LogOut,
  Plus,
  RefreshCw,
  Wallet,
  Sparkles,
  Calendar,
  Tag,
  Loader2,
  X,
} from "lucide-react";

interface ExpenseItem {
  id: number;
  user_id: number;
  description: string;
  value: string;
  type: "Receita" | "Despesa";
  category: string;
  expense_date: string;
  status: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state para nova transação
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"Despesa" | "Receita">("Despesa");
  const [category, setCategory] = useState("Alimentação");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    const res = await apiFetch<ExpenseItem[]>("/expenses");
    if (res.data && Array.isArray(res.data)) {
      setExpenses(res.data);
    }
  }, []);

  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser || !authStorage.isAuthenticated()) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    loadExpenses().finally(() => setLoading(false));
  }, [router, loadExpenses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleLogout = () => {
    authStorage.clearSession();
    router.push("/login");
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description || !value || !category) {
      setFormError("Preencha todos os campos.");
      return;
    }

    if (!user) return;

    setSubmitting(true);

    try {
      const res = await apiFetch("/expenses/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          description,
          value: parseFloat(value),
          type,
          category,
          expense_date: new Date().toISOString(),
        }),
      });

      if (res.error) {
        setFormError(res.error);
        return;
      }

      // Limpar formulário e recarregar
      setDescription("");
      setValue("");
      setShowModal(false);
      await loadExpenses();
    } catch (err: any) {
      setFormError(err.message || "Erro ao salvar transação.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos de saldo
  const totalReceitas = expenses
    .filter((e) => e.type === "Receita")
    .reduce((acc, curr) => acc + parseFloat(curr.value || "0"), 0);

  const totalDespesas = expenses
    .filter((e) => e.type === "Despesa")
    .reduce((acc, curr) => acc + parseFloat(curr.value || "0"), 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col pb-2">
        {/* Top App Header */}
        <div className="p-5 flex items-center justify-between bg-surface/60 backdrop-blur-sm border-b border-surface-border sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-brand-500/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Olá, bem-vindo</div>
              <div className="text-sm font-bold text-white leading-none">{user?.name || "Usuário"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-surface border border-surface-border text-slate-400 hover:text-white active:scale-95 transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-brand-500" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-surface border border-surface-border text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-5">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-surface to-surface-elevated border border-surface-border shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Saldo Disponível</span>
              <span className="flex items-center gap-1 text-[11px] text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                <Sparkles className="w-3 h-3" /> Em tempo real
              </span>
            </div>

            <div className="text-3xl font-extrabold text-white tracking-tight my-2">
              R$ {saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>

            {/* Inflow / Outflow Summary */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Receitas</div>
                  <div className="text-xs font-bold text-emerald-400">
                    +R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Despesas</div>
                  <div className="text-xs font-bold text-rose-400">
                    -R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-brand-500/15 border border-brand-500/30 hover:bg-brand-500/25 active:scale-[0.98] text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Transação</span>
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Transações Recentes
            </h2>
            <span className="text-[11px] text-slate-500">{expenses.length} lançamentos</span>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <span>Carregando dados do MySQL...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center p-4 rounded-2xl bg-surface/40 border border-dashed border-surface-border">
              <Wallet className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">Nenhuma transação cadastrada</p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                Adicione seu primeiro registro para acompanhar seu fluxo financeiro.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
              {expenses.map((item) => {
                const isExpense = item.type === "Despesa";
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense
                            ? "bg-rose-500/15 text-rose-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {isExpense ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight">
                          {item.description}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {item.category}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(item.expense_date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-bold tracking-tight ${
                        isExpense ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isExpense ? "-" : "+"}R${" "}
                      {parseFloat(item.value).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Sheet para Nova Transação */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-[400px] bg-surface-elevated rounded-t-3xl sm:rounded-3xl border border-surface-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Nova Transação</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-3">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-xl border border-surface-border">
                <button
                  type="button"
                  onClick={() => setType("Despesa")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    type === "Despesa"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType("Receita")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    type === "Receita"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Receita
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoço, Salário, Mercado"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface rounded-xl border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface rounded-xl border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface rounded-xl border border-surface-border text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Alimentação">Alimentação</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Salário">Salário</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Transação</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </MobileContainer>
  );
}
