"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, Sparkles, User, PlusCircle } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Início", href: "/dashboard", icon: Home },
    { label: "Extrato", href: "/expenses", icon: ReceiptText },
    { label: "Novo", href: "/expenses/new", icon: PlusCircle, highlight: true },
    { label: "IA Hub", href: "/ai-chat", icon: Sparkles },
    { label: "Perfil", href: "/profile", icon: User },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-surface-border px-3 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-1 text-slate-400 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? "text-brand-500 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
