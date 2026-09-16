"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { ArrowLeft, Lock, Mail, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name || !email || !password) {
      setErrorMessage("Todos os campos são obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1. Cria o usuário
      const res = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      setSuccessMessage("Conta criada com sucesso! Autenticando...");

      // 2. Faz login automático
      const loginRes = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.data?.token && loginRes.data?.user) {
        authStorage.saveSession(loginRes.data.token, loginRes.data.user);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao registrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/login"
            className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs text-slate-400 font-medium">Novo Cadastro</span>
          <div className="w-10" />
        </div>

        {/* Title */}
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Crie sua Conta ✨</h1>
          <p className="text-sm text-slate-400 mt-1">
            Comece a organizar suas finanças com inteligência e controle total.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full pl-10 pr-4 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                className="w-full pl-10 pr-11 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Criar Conta</span>
              )}
            </button>

            <div className="text-center mt-4">
              <span className="text-xs text-slate-400">Já possui uma conta? </span>
              <Link href="/login" className="text-xs text-brand-500 hover:underline font-semibold">
                Fazer login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </MobileContainer>
  );
}
