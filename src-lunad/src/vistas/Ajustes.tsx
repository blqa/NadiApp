import { useEffect, useState } from "react";
import { LuMinus, LuPlus, LuDownload, LuLogOut, LuShieldCheck } from "react-icons/lu";
import { useEstado, type Datos } from "../App";
import type { Ajustes } from "../ciclo";
import { OBJETIVOS } from "../opciones";

export function AjustesVista({ datos }: { datos: Datos }) {
  const { st } = useEstado(datos);
  const [a, setA] = useState<Ajustes>(datos.ajustes);
  const [guardando, setGuardando] = useState(false);
  useEffect(() => setA(datos.ajustes), [datos.ajustes]);
  const cambio = JSON.stringify(a) !== JSON.stringify({ ...datos.ajustes });

  async function guardar() {
    setGuardando(true);
    try { await datos.con.guardarAjustes(a); datos.aviso("Ajustes guardados"); }
    catch { datos.aviso("No se pudo guardar"); }
    finally { setGuardando(false); }
  }
  function exportar() {
    const blob = new Blob([JSON.stringify({ exportado: new Date().toISOString(), ajustes: datos.ajustes, ciclos: datos.ciclos, registros: datos.registros }, null, 2)], { type: "application/json" });
    const el = document.createElement("a");
    el.href = URL.createObjectURL(blob); el.download = "lunad-mis-datos.json"; el.click();
    setTimeout(() => URL.revokeObjectURL(el.href), 3000);
  }

  return (
    <div className="vista ajustes">
      <header className="cabeza-vista"><h1>Ajustes</h1></header>

      <section className="tarjeta">
        <h2>¿Para qué usas LuNad?</h2>
        <div className="objetivos" role="radiogroup">
          {OBJETIVOS.map(o => (
            <button key={o.id} type="button" role="radio" aria-checked={a.goal === o.id} className={a.goal === o.id ? "activo" : ""} onClick={() => setA({ ...a, goal: o.id })}>
              <strong>{o.nombre}</strong><span>{o.nota}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="tarjeta">
        <h2>Tu ciclo</h2>
        <div className="fila-ajuste">
          <div className="interruptor-texto">
            <strong>Calcular con mi historial</strong>
            <span>{st.largos.length ? `Usa el promedio de tus últimos ciclos (${st.largoCiclo} días)` : "Se activa cuando tengas al menos 2 periodos registrados"}</span>
          </div>
          <button type="button" role="switch" aria-checked={a.autoPromedio !== false} className={`interruptor ${a.autoPromedio !== false ? "on" : ""}`} onClick={() => setA({ ...a, autoPromedio: a.autoPromedio === false })}><i /></button>
        </div>
        <Stepper titulo="Duración del ciclo" nota="Días entre un periodo y el siguiente" valor={a.cycleLength} min={18} max={60} cambiar={v => setA({ ...a, cycleLength: v })} />
        <Stepper titulo="Duración del periodo" nota="Días de sangrado" valor={a.periodLength} min={1} max={12} cambiar={v => setA({ ...a, periodLength: v })} />
        {cambio && <button type="button" className="btn primario ancho" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar cambios"}</button>}
      </section>

      <section className="tarjeta">
        <h2>Tus datos</h2>
        <p className="ayuda con-icono"><LuShieldCheck /> Solo tú puedes ver tus registros. Se guardan en tu cuenta y también en este teléfono para que funcione sin internet.</p>
        <button type="button" className="btn suave ancho" onClick={exportar}><LuDownload /> Descargar mis datos</button>
        <button type="button" className="btn suave ancho" onClick={() => (window as any).Sesion?.salir()}><LuLogOut /> Cerrar sesión</button>
      </section>

      <p className="nota-pie">LuNad estima tu ciclo con tus registros. Las predicciones son aproximadas: no son un método anticonceptivo ni sustituyen a un médico.</p>
      <p className="nota-pie version">LuNad 2.0 · hecha con ♡ para Nadia</p>
    </div>
  );
}

function Stepper({ titulo, nota, valor, min, max, cambiar }: { titulo: string; nota: string; valor: number; min: number; max: number; cambiar: (v: number) => void }) {
  return (
    <div className="fila-ajuste">
      <div className="interruptor-texto"><strong>{titulo}</strong><span>{nota}</span></div>
      <div className="stepper">
        <button type="button" aria-label={`Menos ${titulo}`} disabled={valor <= min} onClick={() => cambiar(valor - 1)}><LuMinus /></button>
        <output aria-live="polite">{valor}</output>
        <button type="button" aria-label={`Más ${titulo}`} disabled={valor >= max} onClick={() => cambiar(valor + 1)}><LuPlus /></button>
      </div>
    </div>
  );
}
