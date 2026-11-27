import { useState } from "react";
import { LuArrowRight, LuMinus, LuPlus } from "react-icons/lu";
import type { Datos } from "../App";
import { hoy, sumar, type Objetivo } from "../ciclo";
import { OBJETIVOS } from "../opciones";

/* Primera vez: tres preguntas y listo */
export function Bienvenida({ datos }: { datos: Datos }) {
  const [paso, setPaso] = useState(0);
  const [goal, setGoal] = useState<Objetivo>(datos.ajustes.goal);
  const [inicio, setInicio] = useState(sumar(hoy(), -7));
  const [ciclo, setCiclo] = useState(datos.ajustes.cycleLength);
  const [periodo, setPeriodo] = useState(datos.ajustes.periodLength);
  const [ocupado, setOcupado] = useState(false);

  async function terminar() {
    setOcupado(true);
    try {
      await datos.con.guardarAjustes({ ...datos.ajustes, goal, cycleLength: ciclo, periodLength: periodo, autoPromedio: true });
      await datos.con.nuevoCiclo(inicio);
      datos.aviso("¡Listo! Bienvenida a LuNad ♡");
    } catch { datos.aviso("No se pudo guardar. Revisa tu internet."); setOcupado(false); }
  }

  return (
    <div className="bienvenida">
      <div className="logo-luna grande" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z" fill="currentColor" /></svg></div>
      <div className="pasos" aria-hidden="true">{[0, 1, 2].map(i => <i key={i} className={i <= paso ? "on" : ""} />)}</div>

      {paso === 0 && (
        <section className="paso">
          <h1>Hola, bienvenida a <em>LuNad</em></h1>
          <p>Para empezar, ¿para qué quieres usarla?</p>
          <div className="objetivos">
            {OBJETIVOS.map(o => (
              <button key={o.id} type="button" className={goal === o.id ? "activo" : ""} onClick={() => setGoal(o.id)}>
                <strong>{o.nombre}</strong><span>{o.nota}</span>
              </button>
            ))}
          </div>
          <button className="btn primario ancho" type="button" onClick={() => setPaso(1)}>Siguiente <LuArrowRight /></button>
        </section>
      )}

      {paso === 1 && (
        <section className="paso">
          <h1>¿Cuándo empezó tu último periodo?</h1>
          <p>Si no te acuerdas exacto, pon una fecha aproximada. Después la puedes cambiar.</p>
          <input className="campo-fecha" type="date" value={inicio} max={hoy()} onChange={e => e.target.value && setInicio(e.target.value)} />
          <button className="btn primario ancho" type="button" onClick={() => setPaso(2)}>Siguiente <LuArrowRight /></button>
          <button className="btn texto" type="button" onClick={() => setPaso(0)}>Atrás</button>
        </section>
      )}

      {paso === 2 && (
        <section className="paso">
          <h1>Casi listo</h1>
          <p>Si no sabes, deja estos valores. LuNad aprende de tus registros y se ajusta sola.</p>
          <div className="tarjeta">
            <Contador titulo="Días entre periodos" valor={ciclo} min={18} max={60} cambiar={setCiclo} />
            <Contador titulo="Días de sangrado" valor={periodo} min={1} max={12} cambiar={setPeriodo} />
          </div>
          <button className="btn primario ancho" type="button" disabled={ocupado} onClick={terminar}>{ocupado ? "Guardando…" : "Empezar"}</button>
          <button className="btn texto" type="button" onClick={() => setPaso(1)}>Atrás</button>
        </section>
      )}
    </div>
  );
}

function Contador({ titulo, valor, min, max, cambiar }: { titulo: string; valor: number; min: number; max: number; cambiar: (n: number) => void }) {
  return (
    <div className="fila-ajuste">
      <div className="interruptor-texto"><strong>{titulo}</strong></div>
      <div className="stepper">
        <button type="button" aria-label="Menos" disabled={valor <= min} onClick={() => cambiar(valor - 1)}><LuMinus /></button>
        <output>{valor}</output>
        <button type="button" aria-label="Más" disabled={valor >= max} onClick={() => cambiar(valor + 1)}><LuPlus /></button>
      </div>
    </div>
  );
}
