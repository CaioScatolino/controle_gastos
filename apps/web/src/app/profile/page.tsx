"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { apiFetch } from "@/lib/api";
import { authStorage, UserSession } from "@/lib/auth";
import { ArrowLeft, User, Mail, Shield, LogOut, Database, Layers } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const current = authStorage.getUser();
    if (!current) {
      router.push("/login");
      return;
    }
    setUser(current);
  }, [router]);

  const handleLogout = () => {
    authStorage.clearSession();
    router.push("/login");
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between pt-2 mb-6">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs text-slate-400 font-medium">Meu Perfil</span>
          <div className="w-10" />
        </div>

        {/* User Card */}
        <div className="p-5 rounded-3xl bg-surface border border-surface-border flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-brand-500/25 mb-3">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <h2 className="text-base font-bold text-white">{user?.name || "Usuário"}</h2>
          <span className="text-xs text-slate-400 mt-0.5">{user?.email || "email@exemplo.com"}</span>

          <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Sessão Ativa via JWT
          </div>
        </div>

        {/* Architecture Specs */}
        <div className="space-y-3 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
            Informações do Sistema
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-brand-500" />
              <span className="text-xs text-slate-300">Arquitetura</span>
            </div>
            <span className="text-xs font-semibold text-white">Monorepo (apps/api + apps/web)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Banco de Dados</span>
            </div>
            <span className="text-xs font-semibold text-white">MySQL (XAMPP) via Drizzle</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
