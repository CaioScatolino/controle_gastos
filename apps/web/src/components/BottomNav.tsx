"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, Sparkles, User, Plus } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Início", href: "/dashboard", icon: Home },
    { label: "Extrato", href: "/expenses", icon: ReceiptText },
    { label: "Novo", href: "/expenses/new", icon: Plus, highlight: true },
    { label: "IA Hub", href: "/ai-chat", icon: Sparkles },
    { label: "Perfil", href: "/profile", icon: User },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-xl border-t border-surface-border/80 px-3 pt-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group active:scale-90 transition-transform duration-150"
              >
                <div className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 border-2 border-background">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] mt-1 text-slate-300 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 active:scale-95 ${isActive
                  ? "text-brand-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? "scale-110" : ""
                  }`}
              />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
