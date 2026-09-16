"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { apiFetch } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function NewExpensePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<"Despesa" | "Receita">("Despesa");
  const [category, setCategory] = useState("Alimentação");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = authStorage.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (!description || !value) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/expenses/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          description,
          value: parseFloat(value),
          type,
          category,
          expense_date: new Date().toISOString(),
        }),
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar transação.");
    } finally {
      setLoading(false);
    }
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
          <span className="text-xs text-slate-400 font-medium">Novo Lançamento</span>
          <div className="w-10" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          {/* Switch Receita / Despesa */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-2xl border border-surface-border">
            <button
              type="button"
              onClick={() => setType("Despesa")}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                type === "Despesa"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("Receita")}
              className={`py-2.5 text-xs font-semibold rounded-xl transition-all ${
                type === "Receita"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Combustível, Supermercado, Freela"
              className="w-full px-4 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface rounded-2xl border border-surface-border text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Alimentação">Alimentação</option>
                <option value="Moradia">Moradia</option>
                <option value="Transporte">Transporte</option>
                <option value="Lazer">Lazer</option>
                <option value="Saúde">Saúde</option>
                <option value="Educação">Educação</option>
                <option value="Salário">Salário</option>
                <option value="Investimentos">Investimentos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando transação...</span>
                </>
              ) : (
                <span>Confirmar e Salvar</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
