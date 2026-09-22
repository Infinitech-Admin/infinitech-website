// 📁 Place this file at: components/portal-demo-public/DemoToaster.tsx
"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

type Toast = { id: number; message: string; variant: "success" | "info" };

type ToastCtx = {
  show: (message: string, variant?: Toast["variant"]) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

let idCounter = 0;

export function DemoToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, variant: Toast["variant"] = "success") => {
      const id = idCounter++;
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 3200);
    },
    [],
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 shadow-lg px-4 py-3 text-sm min-w-[260px] animate-in slide-in-from-bottom-2"
          >
            {t.variant === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-cyan-600 shrink-0" />
            )}
            <span className="flex-1 text-slate-700 dark:text-slate-200">
              {t.message}
            </span>
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useDemoToast() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useDemoToast must be used within DemoToastProvider");
  return ctx;
}
