"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MobileContainer } from "@/components/MobileContainer";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Wallet, Sparkles, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    // Redireciona se já estiver autenticado
    if (authStorage.isAuthenticated()) {
      router.push("/dashboard");
      return;
    }

    // Testa a conexão com a API
    apiFetch("/ping")
      .then((res) => {
        if (res.data?.pong) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      })
      .catch(() => setApiStatus("offline"));
  }, [router]);

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col justify-between p-6">
        {/* Top Header & Status */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Gastos.AI</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-surface border border-surface-border">
            <span className="text-slate-400">API:</span>
            {apiStatus === "checking" && (
              <span className="text-amber-400 animate-pulse text-[11px]">Conectando...</span>
            )}
            {apiStatus === "online" && (
              <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            )}
            {apiStatus === "offline" && (
              <span className="text-rose-400 font-medium flex items-center gap-1 text-[11px]">
                <XCircle className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="my-auto py-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema Financeiro Modular</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Controle de Gastos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-400">Inteligente</span>
          </h1>

          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Gestão de despesas construída com arquitetura limpa, Drizzle ORM, MySQL e preparada para IA multimodal no mobile.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-surface border border-surface-border/60">
              <div className="text-emerald-400 font-semibold text-xs mb-1">Mobile-First</div>
              <div className="text-slate-400 text-[11px]">Design nativo para smartphone</div>
            </div>
            <div className="p-3 rounded-2xl bg-surface border border-surface-border/60">
              <div className="text-brand-500 font-semibold text-xs mb-1">Segurança JWT</div>
              <div className="text-slate-400 text-[11px]">Sessão stateless e criptografada</div>
            </div>
          </div>
        </div>

        {/* Actions Bottom */}
        <div className="space-y-3 pb-4">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/25"
          >
            <span>Acessar Conta</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-surface hover:bg-surface-elevated active:scale-[0.98] text-slate-200 font-semibold text-sm border border-surface-border transition-all"
          >
            Criar Nova Conta
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ambiente Local • MySQL + Node.js API</span>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
