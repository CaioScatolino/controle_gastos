"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { ExpenseType, NewExpensePayload } from "@/types/expense";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<NewExpensePayload, "user_id">
  ) => Promise<{ success: boolean; error?: string }>;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<ExpenseType>("Despesa");
  const [category, setCategory] = useState("Alimentação");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description || !value || !category) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await onSubmit({
        description,
        value: parseFloat(value),
        type,
        category,
        expense_date: new Date().toISOString(),
      });

      if (!res.success) {
        setError(res.error || "Não foi possível criar a transação.");
        return;
      }

      // Reset
      setDescription("");
      setValue("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-[400px] bg-surface-elevated rounded-t-3xl sm:rounded-3xl border border-surface-border p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Nova Transação</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Switch Receita / Despesa */}
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
                <option value="Saúde">Saúde</option>
                <option value="Educação">Educação</option>
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
  );
};
