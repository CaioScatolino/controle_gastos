"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { authStorage, UserSession } from "@/lib/auth";
import { useExpenses } from "@/hooks/useExpenses";

// Componentes Modulares da Dashboard
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { NewTransactionModal } from "@/components/dashboard/NewTransactionModal";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Todo o estado e lógica de negócio desacoplados no Custom Hook
  const {
    expenses,
    loading,
    refreshing,
    saldoLiquido,
    totalReceitas,
    totalDespesas,
    refresh,
    createExpense,
    deleteExpense,
  } = useExpenses();

  // Validação de Sessão
  useEffect(() => {
    const currentUser = authStorage.getUser();
    if (!currentUser || !authStorage.isAuthenticated()) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    authStorage.clearSession();
    router.push("/login");
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col pb-2">
        {/* Cabeçalho */}
        <DashboardHeader
          user={user}
          refreshing={refreshing}
          onRefresh={refresh}
          onLogout={handleLogout}
        />

        {/* Card de Saldo e Totais */}
        <BalanceCard
          saldo={saldoLiquido}
          receitas={totalReceitas}
          despesas={totalDespesas}
          onOpenModal={() => setIsModalOpen(true)}
        />

        {/* Listagem de Transações com ação de exclusão */}
        <TransactionList
          expenses={expenses}
          loading={loading}
          onDelete={deleteExpense}
        />
      </div>

      {/* Modal de Nova Transação */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createExpense}
      />

      {/* Navegação Inferior */}
      <BottomNav />
    </MobileContainer>
  );
}
