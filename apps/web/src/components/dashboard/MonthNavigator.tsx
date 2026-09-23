"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthNavigatorProps {
    month: number; // 1 a 12
    year: number;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
}

const MONTH_NAMES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
    month,
    year,
    onPrev,
    onNext,
    onToday,
}) => {
    const today = new Date();
    const isCurrentMonth =
        today.getMonth() + 1 === month && today.getFullYear() === year;

    const monthLabel = `${MONTH_NAMES[month - 1]} de ${year}`;

    return (
        <div className="px-5 pt-3 pb-1">
            <div className="flex items-center justify-between bg-surface-elevated/70 backdrop-blur-md border border-surface-border rounded-2xl px-3 py-2 shadow-sm">
                {/* Botão Mês Anterior */}
                <button
                    onClick={onPrev}
                    aria-label="Mês anterior"
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Mês e Ano Central */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-bold text-slate-100 tracking-wide capitalize">
                        {monthLabel}
                    </span>

                    {/* Atalho para o Mês Atual se estiver navegando em outro período */}
                    {!isCurrentMonth && (
                        <button
                            onClick={onToday}
                            className="text-[10px] font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full hover:bg-brand-500/30 transition-all active:scale-95 ml-1"
                        >
                            Hoje
                        </button>
                    )}
                </div>

                {/* Botão Próximo Mês */}
                <button
                    onClick={onNext}
                    aria-label="Próximo mês"
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
