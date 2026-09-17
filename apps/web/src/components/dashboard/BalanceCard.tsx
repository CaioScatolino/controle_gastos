"use client";

import React from "react";
import { TrendingUp, TrendingDown, Sparkles, Plus } from "lucide-react";

interface BalanceCardProps {
  saldo: number;
  receitas: number;
  despesas: number;
  onOpenModal: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  saldo,
  receitas,
  despesas,
  onOpenModal,
}) => {
  return (
    <div className="p-5">
      <div className="p-5 rounded-3xl bg-gradient-to-br from-surface to-surface-elevated border border-surface-border shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Saldo Disponível</span>
          <span className="flex items-center gap-1 text-[11px] text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
            <Sparkles className="w-3 h-3" /> Em tempo real
          </span>
        </div>

        <div
          className={`text-3xl font-extrabold tracking-tight my-2 ${
            saldo < 0 ? "text-rose-400" : "text-white"
          }`}
        >
          R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>

        {/* Resumo Receitas / Despesas */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Receitas</div>
              <div className="text-xs font-bold text-emerald-400">
                +R${" "}
                {receitas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
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
                -R${" "}
                {despesas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Ação Rápida */}
      <div className="mt-4">
        <button
          onClick={onOpenModal}
          className="w-full py-3 px-4 rounded-2xl bg-brand-500/15 border border-brand-500/30 hover:bg-brand-500/25 active:scale-[0.98] text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Transação</span>
        </button>
      </div>
    </div>
  );
};
