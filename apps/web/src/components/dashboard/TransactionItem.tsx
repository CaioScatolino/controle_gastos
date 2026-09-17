"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Tag, Calendar, Trash2, Loader2 } from "lucide-react";
import { ExpenseItem } from "@/types/expense";

interface TransactionItemProps {
  item: ExpenseItem;
  onDelete?: (id: number) => Promise<any>;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const isExpense = item.type === "Despesa";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;

    if (window.confirm(`Deseja realmente remover "${item.description}"?`)) {
      setDeleting(true);
      await onDelete(item.id);
      setDeleting(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between hover:border-slate-700 transition-colors group">
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

      <div className="flex items-center gap-2.5">
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

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-60 hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-all"
            title="Excluir lançamento"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
