"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, TrendingUp, TrendingDown, Tag, Calendar, Filter, Loader2 } from "lucide-react";

interface ExpenseItem {
  id: number;
  description: string;
  value: string;
  type: "Receita" | "Despesa";
  category: string;
  expense_date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"Todos" | "Receita" | "Despesa">("Todos");

  useEffect(() => {
    apiFetch<ExpenseItem[]>("/expenses")
      .then((res) => {
        if (res.data) setExpenses(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = expenses.filter((item) => {
    if (filterType === "Todos") return true;
    return item.type === filterType;
  });

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2 mb-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs text-slate-400 font-medium">Extrato Completo</span>
          <div className="w-10" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          {(["Todos", "Receita", "Despesa"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === t
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-surface border border-surface-border text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span>Consultando banco de dados...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-slate-500">Nenhum registro encontrado para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isExpense = item.type === "Despesa";
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between"
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
                    className={`text-xs font-bold ${
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
      <BottomNav />
    </MobileContainer>
  );
}
