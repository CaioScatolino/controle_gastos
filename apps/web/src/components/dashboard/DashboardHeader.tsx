"use client";

import React from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { UserSession } from "@/lib/auth";

interface DashboardHeaderProps {
  user: UserSession | null;
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  refreshing,
  onRefresh,
  onLogout,
}) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <header className="p-5 flex items-center justify-between bg-surface/60 backdrop-blur-sm border-b border-surface-border sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-brand-500/20">
          {initials}
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">
            Olá, bem-vindo
          </div>
          <div className="text-sm font-bold text-white leading-none">
            {user?.name || "Usuário"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-surface border border-surface-border text-slate-400 hover:text-white active:scale-95 transition-all"
          title="Atualizar dados"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin text-brand-500" : ""
            }`}
          />
        </button>
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-surface border border-surface-border text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
          title="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
