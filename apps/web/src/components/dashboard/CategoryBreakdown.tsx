"use client";

import React from "react";
import { PieChart, Tag } from "lucide-react";
import { CategoryTotal } from "@/types/expense";

interface CategoryBreakdownProps {
    categories: CategoryTotal[];
    totalDespesas: number;
}

// Paleta dinâmica por categoria para o design Dark Glassmorphism
const CATEGORY_STYLES: Record<
    string,
    { bar: string; badgeText: string; badgeBg: string }
> = {
    Alimentação: {
        bar: "bg-gradient-to-r from-amber-500 to-orange-500",
        badgeText: "text-amber-400",
        badgeBg: "bg-amber-500/15 border-amber-500/20",
    },
    Moradia: {
        bar: "bg-gradient-to-r from-indigo-500 to-blue-500",
        badgeText: "text-indigo-400",
        badgeBg: "bg-indigo-500/15 border-indigo-500/20",
    },
    Transporte: {
        bar: "bg-gradient-to-r from-cyan-500 to-teal-500",
        badgeText: "text-cyan-400",
        badgeBg: "bg-cyan-500/15 border-cyan-500/20",
    },
    Saúde: {
        bar: "bg-gradient-to-r from-emerald-500 to-green-500",
        badgeText: "text-emerald-400",
        badgeBg: "bg-emerald-500/15 border-emerald-500/20",
    },
    Educação: {
        bar: "bg-gradient-to-r from-violet-500 to-purple-500",
        badgeText: "text-violet-400",
        badgeBg: "bg-violet-500/15 border-violet-500/20",
    },
    Lazer: {
        bar: "bg-gradient-to-r from-pink-500 to-rose-500",
        badgeText: "text-pink-400",
        badgeBg: "bg-pink-500/15 border-pink-500/20",
    },
};

const DEFAULT_STYLE = {
    bar: "bg-gradient-to-r from-brand-500 to-indigo-500",
    badgeText: "text-brand-400",
    badgeBg: "bg-brand-500/15 border-brand-500/20",
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
    categories,
    totalDespesas,
}) => {
    if (categories.length === 0 || totalDespesas === 0) {
        return null; // Não exibe se o mês não tiver despesas
    }

    return (
        <div className="px-5 pb-3">
            <div className="p-4 rounded-3xl bg-surface-elevated/70 border border-surface-border backdrop-blur-md">
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400">
                            <PieChart className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                            Gastos por Categoria
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                        {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
                    </span>
                </div>

                {/* Lista de Barras de Progresso */}
                <div className="space-y-3.5">
                    {categories.map((item) => {
                        const style = CATEGORY_STYLES[item.category] || DEFAULT_STYLE;

                        return (
                            <div key={item.category} className="group">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-slate-200">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            ({item.count} {item.count === 1 ? "item" : "itens"})
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-100">
                                            R${" "}
                                            {item.total.toLocaleString("pt-BR", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${style.badgeBg} ${style.badgeText}`}
                                        >
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>

                                {/* Barra de Progresso com Transição Suave */}
                                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar}`}
                                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
