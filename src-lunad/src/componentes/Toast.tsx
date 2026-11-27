import { useCallback, useRef, useState } from "react";
import { LuCheck } from "react-icons/lu";

export function useToast() {
  const [toast, setToast] = useState<{ texto: string; n: number } | null>(null);
  const t = useRef<number>(0);
  const aviso = useCallback((texto: string) => {
    clearTimeout(t.current);
    setToast({ texto, n: Date.now() });
    t.current = window.setTimeout(() => setToast(null), 2600);
  }, []);
  return { toast, aviso };
}

export function Toast({ toast }: { toast: { texto: string; n: number } | null }) {
  return (
    <div className="toast-zona" role="status" aria-live="polite">
      {toast && <div className="toast" key={toast.n}><LuCheck /> {toast.texto}</div>}
    </div>
  );
}
