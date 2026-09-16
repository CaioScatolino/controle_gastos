"use client";

import React from "react";
import Link from "next/link";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNav } from "@/components/BottomNav";
import { Sparkles, ArrowLeft, Bot, Camera, Mic, Cpu } from "lucide-react";

export default function AiChatPlaceholder() {
  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs text-slate-400 font-medium">Núcleo de IA</span>
          <div className="w-10" />
        </div>

        <div className="my-auto text-center py-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 to-indigo-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-4 animate-pulse">
            <Bot className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fase 2 do Projeto Impossível</span>
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">Chat Multimodal com IA</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Em breve este módulo receberá fotos de comprovantes fiscais e áudios para extrair e categorizar despesas automaticamente com LLMs e mensageria.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6 text-left">
            <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
              <Camera className="w-5 h-5 text-indigo-400 mb-1.5" />
              <div className="text-xs font-semibold text-white">OCR de Recibos</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Visão computacional</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-surface-border">
              <Mic className="w-5 h-5 text-emerald-400 mb-1.5" />
              <div className="text-xs font-semibold text-white">Áudios Rápidos</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Transcrição e parsing</div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
