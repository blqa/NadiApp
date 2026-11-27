import { useEffect, useState, type ReactNode } from "react";
import { LuX } from "react-icons/lu";

export function Modal({ titulo, subtitulo, cerrar, children, clase = "" }: { titulo: string; subtitulo?: string; cerrar: () => void; children: ReactNode; clase?: string }) {
  const [fuera, setFuera] = useState(false);
  const salir = () => { setFuera(true); setTimeout(cerrar, 200); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") salir(); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  return (
    <div className={`modal-fondo ${fuera ? "fuera" : ""}`} onClick={e => { if (e.target === e.currentTarget) salir(); }}>
      <section className={`modal ${clase}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="asa" aria-hidden="true" />
        <header>
          <div><h2>{titulo}</h2>{subtitulo && <p>{subtitulo}</p>}</div>
          <button type="button" className="cerrar" onClick={salir} aria-label="Cerrar"><LuX /></button>
        </header>
        <div className="modal-cuerpo">{children}</div>
      </section>
    </div>
  );
}

export function Pestanas<T extends string>({ opciones, valor, cambiar }: { opciones: [T, string][]; valor: T; cambiar: (v: T) => void }) {
  return (
    <div className="pestanas" role="tablist">
      {opciones.map(([id, n]) => <button key={id} type="button" role="tab" aria-selected={valor === id} className={valor === id ? "on" : ""} onClick={() => cambiar(id)}>{n}</button>)}
    </div>
  );
}
