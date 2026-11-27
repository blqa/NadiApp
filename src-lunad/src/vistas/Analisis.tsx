import { useMemo } from "react";
import { LuInfo } from "react-icons/lu";
import { useEstado, type Datos } from "../App";
import { bonita, dif, frecuencias, hoy, sumar, ventanaQueSigue, mayuscula } from "../ciclo";
import { ANIMOS } from "../opciones";

export function Analisis({ datos }: { datos: Datos }) {
  const { st, est } = useEstado(datos);
  const h = hoy();

  // historial: del más nuevo al más viejo
  const historial = useMemo(() => {
    const cs = datos.ciclos;
    return cs.map((c, i) => {
      const sig = cs[i + 1];
      const largo = sig ? dif(sig.startDate, c.startDate) : null;
      const periodo = c.endDate ? dif(c.endDate, c.startDate) + 1 : null;
      return { c, largo, periodo, actual: !sig, diaHoy: !sig ? dif(h, c.startDate) + 1 : null };
    }).reverse().slice(0, 12);
  }, [datos.ciclos, h]);

  const maxLargo = Math.max(35, ...historial.map(x => x.largo ?? x.diaHoy ?? 0));
  const sintomas = useMemo(() => frecuencias(datos.registros, "symptoms").slice(0, 6), [datos.registros]);
  const animos = useMemo(() => frecuencias(datos.registros, "mood").slice(0, 5), [datos.registros]);
  const maxS = Math.max(1, ...sintomas.map(x => x[1]));
  const maxA = Math.max(1, ...animos.map(x => x[1]));
  const diasRegistrados = Object.keys(datos.registros).filter(f => dif(f, sumar(h, -30)) >= 0).length;

  return (
    <div className="vista analisis">
      <header className="cabeza-vista"><h1>Análisis</h1></header>

      <div className="stats">
        <div className="tarjeta stat">
          <span>Ciclo promedio</span>
          <strong>{st.largoCiclo}<small> días</small></strong>
          <em>{st.usandoPromedio ? `De ${Math.min(6, st.largos.length)} ${st.largos.length === 1 ? "ciclo" : "ciclos"}` : "De tus ajustes"}</em>
        </div>
        <div className="tarjeta stat">
          <span>Periodo promedio</span>
          <strong>{st.largoPeriodo}<small> días</small></strong>
          <em>{st.periodos.length ? `De ${st.periodos.length} registrados` : "De tus ajustes"}</em>
        </div>
        <div className={`tarjeta stat ${st.regular === false ? "aviso" : ""}`}>
          <span>Regularidad</span>
          <strong className="texto">{st.regular == null ? "—" : st.regular ? "Regular" : "Variable"}</strong>
          <em>{st.variacion == null ? "Faltan ciclos" : `Varía ${st.variacion} ${st.variacion === 1 ? "día" : "días"}`}</em>
        </div>
      </div>

      <section className="tarjeta">
        <h2>Tus ciclos</h2>
        <p className="ayuda">Cada barra es un ciclo. La parte roja son los días de periodo.</p>
        <ul className="barras-ciclo">
          {historial.map(x => {
            const largo = x.largo ?? x.diaHoy ?? 0;
            const per = x.periodo ?? Math.min(st.largoPeriodo, largo);
            return (
              <li key={x.c.id}>
                <time>{bonita(x.c.startDate, { day: "numeric", month: "short" })}</time>
                <div className="barra-fondo">
                  <div className={`barra ${x.actual ? "actual" : ""}`} style={{ width: `${(largo / maxLargo) * 100}%` }}>
                    <div className="barra-periodo" style={{ width: `${Math.min(100, (per / Math.max(1, largo)) * 100)}%` }} />
                  </div>
                </div>
                <span className="barra-num">{x.actual ? `${largo}d · en curso` : `${largo} días`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {est && (
        <section className="tarjeta proximos">
          <h2>Lo que sigue</h2>
          <dl>
            <div><dt>Próximo periodo</dt><dd>{est.fase === "retraso" ? `Retrasado (se esperaba ${bonita(est.siguiente, { day: "numeric", month: "short" })})` : mayuscula(bonita(est.siguiente, { weekday: "short", day: "numeric", month: "long" }))}</dd></div>
            <div><dt>Ventana fértil</dt><dd>{bonita(ventanaQueSigue(est, st).fertilIni, { day: "numeric", month: "short" })} – {bonita(ventanaQueSigue(est, st).fertilFin, { day: "numeric", month: "short" })}</dd></div>
            <div><dt>Ovulación estimada</dt><dd>{mayuscula(bonita(ventanaQueSigue(est, st).ovulacion, { weekday: "short", day: "numeric", month: "long" }))}</dd></div>
          </dl>
        </section>
      )}

      <section className="tarjeta">
        <h2>Síntomas más comunes</h2>
        <p className="ayuda">Últimos 90 días</p>
        {sintomas.length ? (
          <ul className="frecuencias">
            {sintomas.map(([n, c]) => (
              <li key={n}><span>{n}</span><div className="barra-fondo"><div className="barra sintoma" style={{ width: `${(c / maxS) * 100}%` }} /></div><b>{c}</b></li>
            ))}
          </ul>
        ) : <p className="vacio">Cuando registres síntomas, aquí verás cuáles se repiten más.</p>}
      </section>

      <section className="tarjeta">
        <h2>Cómo te has sentido</h2>
        <p className="ayuda">Últimos 90 días</p>
        {animos.length ? (
          <ul className="frecuencias">
            {animos.map(([n, c]) => {
              const a = ANIMOS.find(x => x.id === n);
              return <li key={n}><span>{a?.emoji} {a?.nombre ?? n}</span><div className="barra-fondo"><div className="barra animo" style={{ width: `${(c / maxA) * 100}%` }} /></div><b>{c}</b></li>;
            })}
          </ul>
        ) : <p className="vacio">Registra cómo te sientes para ver tus patrones.</p>}
      </section>

      <p className="nota-pie"><LuInfo /> {diasRegistrados} {diasRegistrados === 1 ? "día registrado" : "días registrados"} en los últimos 30 días. Mientras más registres, más exactas son las predicciones. LuNad no sustituye la opinión de un médico.</p>
    </div>
  );
}
