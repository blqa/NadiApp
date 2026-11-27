import { useEffect, useMemo, useState } from "react";
import { LuX, LuDroplet, LuHeart, LuTrash2, LuNotebookPen, LuCircleAlert } from "react-icons/lu";
import { useEstado, type Datos } from "../App";
import { bonita, dif, hoy, type Fecha, type Registro } from "../ciclo";
import { ANIMOS, CERVICAL, FASES, FLUJOS, PROTECCION, SINTOMAS } from "../opciones";

export function HojaRegistro({ datos, fecha, cerrar }: { datos: Datos; fecha: Fecha; cerrar: () => void }) {
  const { est } = useEstado(datos, fecha);
  const previo = datos.registros[fecha] ?? {};
  const cicloQueEmpieza = datos.ciclos.find(c => c.startDate === fecha);
  // ciclo al que pertenece este día (para marcar "último día de periodo")
  const cicloDelDia = est?.ciclo;
  const diasDesdeInicio = cicloDelDia ? dif(fecha, cicloDelDia.startDate) : -1;
  const puedeTerminar = cicloDelDia && diasDesdeInicio >= 0 && diasDesdeInicio <= 14;

  const [empieza, setEmpieza] = useState(!!cicloQueEmpieza);
  const [termina, setTermina] = useState(!!cicloDelDia?.endDate && cicloDelDia.endDate === fecha);
  const [r, setR] = useState<Registro>({ ...previo, symptoms: [...(previo.symptoms ?? [])] });
  const [ocupado, setOcupado] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const futuro = dif(fecha, hoy()) > 0;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") salir(); };
    addEventListener("keydown", tecla);
    return () => { document.body.style.overflow = prevOverflow; removeEventListener("keydown", tecla); };
  }, []);

  function salir() { setSaliendo(true); setTimeout(cerrar, 220); }
  const alternar = <K extends keyof Registro>(k: K, v: Registro[K]) => setR(x => ({ ...x, [k]: x[k] === v ? undefined : v }));
  const sintoma = (s: string) => setR(x => ({ ...x, symptoms: x.symptoms?.includes(s) ? x.symptoms.filter(y => y !== s) : [...(x.symptoms ?? []), s] }));

  const vacio = useMemo(() => !r.mood && !r.symptoms?.length && !r.flow && !r.cervical && !r.intimate && !r.notes?.trim(), [r]);

  async function guardar() {
    setOcupado(true);
    try {
      const tareas: Promise<void>[] = [];
      if (empieza && !cicloQueEmpieza) tareas.push(datos.con.nuevoCiclo(fecha));
      if (!empieza && cicloQueEmpieza) tareas.push(datos.con.borrarCiclo(cicloQueEmpieza.id));
      if (cicloDelDia && puedeTerminar && !(cicloQueEmpieza && !empieza)) {
        const era = cicloDelDia.endDate === fecha;
        if (termina && !era) tareas.push(datos.con.actualizarCiclo(cicloDelDia.id, { endDate: fecha }));
        if (!termina && era) tareas.push(datos.con.actualizarCiclo(cicloDelDia.id, { endDate: undefined }));
      }
      const limpio: Registro = {};
      if (r.mood) limpio.mood = r.mood;
      if (r.symptoms?.length) limpio.symptoms = r.symptoms;
      if (r.flow) limpio.flow = r.flow;
      if (r.cervical) limpio.cervical = r.cervical;
      if (r.intimate) { limpio.intimate = true; limpio.protection = r.protection || "Condón"; }
      if (r.notes?.trim()) limpio.notes = r.notes.trim().slice(0, 1000);
      const habia = Object.keys(previo).some(k => k !== "updatedAt");
      if (!vacio || habia) tareas.push(datos.con.guardarRegistro(fecha, vacio ? null : limpio));
      await Promise.all(tareas);
      datos.aviso(vacio && !habia && !tareas.length ? "Sin cambios" : "Guardado ✨");
      salir();
    } catch {
      datos.aviso("No se pudo guardar. Intenta otra vez.");
      setOcupado(false);
    }
  }

  async function borrarTodo() {
    setOcupado(true);
    try {
      await datos.con.guardarRegistro(fecha, null);
      datos.aviso("Registro borrado");
      salir();
    } catch { setOcupado(false); }
  }

  const fase = est ? FASES[est.fase] : null;

  return (
    <div className={`hoja-fondo ${saliendo ? "fuera" : ""}`} onClick={e => { if (e.target === e.currentTarget) salir(); }}>
      <section className="hoja" role="dialog" aria-modal="true" aria-labelledby="hoja-titulo">
        <div className="asa" aria-hidden="true" />
        <header className="hoja-cabeza">
          <div>
            <h2 id="hoja-titulo">{dif(fecha, hoy()) === 0 ? "Hoy" : bonita(fecha, { weekday: "long" })}, {bonita(fecha)}</h2>
            {fase && est && <span className="fase-mini" style={{ color: fase.color }}>● Día {est.diaCiclo} · {fase.corto}</span>}
          </div>
          <button type="button" className="btn-icono" onClick={salir} aria-label="Cerrar"><LuX /></button>
        </header>

        {futuro && <p className="aviso-futuro"><LuCircleAlert /> Es un día que todavía no llega. Puedes marcar cuándo crees que empieza tu periodo.</p>}

        <div className="grupo periodo-grupo">
          <Interruptor icono={<LuDroplet />} titulo="Empezó mi periodo" nota="Marca este día como el día 1" on={empieza} cambiar={setEmpieza} color="periodo" />
          {puedeTerminar && !empieza && (
            <Interruptor icono={<LuDroplet />} titulo="Último día de periodo" nota="Así LuNad aprende cuánto te dura" on={termina} cambiar={setTermina} color="periodo" />
          )}
        </div>

        {!futuro && <>
          <h3>Sangrado</h3>
          <div className="chips">
            {FLUJOS.map((f, i) => (
              <button key={f} type="button" aria-pressed={r.flow === f} className={`chip rojo ${r.flow === f ? "on" : ""}`} onClick={() => alternar("flow", f)}>
                <span className="gotas">{Array.from({ length: i + 1 }, (_, k) => <i key={k} />)}</span>{f}
              </button>
            ))}
          </div>

          <h3>¿Cómo te sientes?</h3>
          <div className="animos">
            {ANIMOS.map(a => (
              <button key={a.id} type="button" aria-pressed={r.mood === a.id} className={r.mood === a.id ? "on" : ""} onClick={() => alternar("mood", a.id)}>
                <span className="emoji">{a.emoji}</span><span>{a.nombre}</span>
              </button>
            ))}
          </div>

          <h3>Síntomas</h3>
          <div className="chips">
            {SINTOMAS.map(s => (
              <button key={s.id} type="button" aria-pressed={!!r.symptoms?.includes(s.id)} className={`chip ${r.symptoms?.includes(s.id) ? "on" : ""}`} onClick={() => sintoma(s.id)}>{s.nombre}</button>
            ))}
          </div>

          <h3>Flujo vaginal</h3>
          <div className="chips">
            {CERVICAL.map(c => (
              <button key={c.id} type="button" aria-pressed={r.cervical === c.id} className={`chip morado ${r.cervical === c.id ? "on" : ""}`} onClick={() => alternar("cervical", c.id)}>
                {c.id}<small>{c.nota}</small>
              </button>
            ))}
          </div>

          <div className="grupo">
            <Interruptor icono={<LuHeart />} titulo="Actividad íntima" nota="Solo tú lo ves" on={!!r.intimate} cambiar={v => setR(x => ({ ...x, intimate: v || undefined, protection: v ? x.protection || "Condón" : undefined }))} color="azul" />
            {r.intimate && (
              <div className="chips sub">
                {PROTECCION.map(p => (
                  <button key={p} type="button" aria-pressed={r.protection === p} className={`chip azul ${r.protection === p ? "on" : ""}`} onClick={() => setR(x => ({ ...x, protection: p }))}>{p}</button>
                ))}
              </div>
            )}
          </div>

          <h3><LuNotebookPen /> Nota</h3>
          <textarea className="nota" rows={3} maxLength={1000} placeholder="Algo que quieras recordar de este día…" value={r.notes ?? ""} onChange={e => setR(x => ({ ...x, notes: e.target.value }))} />
        </>}

        <div className="hoja-acciones">
          {Object.keys(previo).some(k => k !== "updatedAt") && (
            <button type="button" className="btn-icono peligro" onClick={borrarTodo} disabled={ocupado} aria-label="Borrar el registro de este día"><LuTrash2 /></button>
          )}
          <button type="button" className="btn primario ancho" onClick={guardar} disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar"}</button>
        </div>
      </section>
    </div>
  );
}

function Interruptor({ icono, titulo, nota, on, cambiar, color }: { icono: React.ReactNode; titulo: string; nota: string; on: boolean; cambiar: (v: boolean) => void; color: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`fila-interruptor ${color} ${on ? "on" : ""}`} onClick={() => cambiar(!on)}>
      <span className="fi-icono">{icono}</span>
      <span className="interruptor-texto"><strong>{titulo}</strong><span>{nota}</span></span>
      <span className={`interruptor ${on ? "on" : ""}`}><i /></span>
    </button>
  );
}
