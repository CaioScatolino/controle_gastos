"use client";

import React from "react";
import { Wallet, Loader2 } from "lucide-react";
import { ExpenseItem } from "@/types/expense";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  expenses: ExpenseItem[];
  loading: boolean;
  onDelete?: (id: number) => Promise<any>;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  expenses,
  loading,
  onDelete,
}) => {
  return (
    <div className="px-5 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Transações Recentes
        </h2>
        <span className="text-[11px] text-slate-500">
          {expenses.length} {expenses.length === 1 ? "lançamento" : "lançamentos"}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          <span>Carregando dados do MySQL...</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center p-4 rounded-2xl bg-surface/40 border border-dashed border-surface-border">
          <Wallet className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-xs font-medium text-slate-400">
            Nenhuma transação cadastrada
          </p>
          <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
            Adicione seu primeiro registro para acompanhar seu fluxo financeiro.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
          {expenses.map((item) => (
            <TransactionItem key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};
