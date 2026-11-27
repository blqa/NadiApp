import { useMemo, useState } from "react";
import { LuDroplet, LuPlus, LuSparkles, LuCalendarHeart, LuChevronRight, LuCheck, LuShieldCheck } from "react-icons/lu";
import { useEstado, type Datos, type Pestana } from "../App";
import { Anillo } from "../componentes/Anillo";
import { bonita, dif, hoy, marcas, sumar, aDate, ventanaQueSigue, mayuscula } from "../ciclo";
import { ANIMOS, FASES, consejo } from "../opciones";

export function Hoy({ datos, ir }: { datos: Datos; ir: (p: Pestana) => void }) {
  const h = hoy();
  const { st, est } = useEstado(datos, h);
  const [ocupado, setOcupado] = useState(false);
  const nombre = (window as any).Sesion?.nombre || "Nadia";
  const semana = useMemo(() => Array.from({ length: 7 }, (_, i) => sumar(h, i - 3)), [h]);
  const m = useMemo(() => marcas(datos.ciclos, st, semana[0], semana[6]), [datos.ciclos, st, semana]);
  if (!est) return null;

  const fase = FASES[est.fase];
  const vf = ventanaQueSigue(est, st, h);
  const retraso = Math.max(0, -est.diasParaPeriodo);
  const tip = consejo(est.fase, datos.ajustes.goal, retraso);
  const reg = datos.registros[h];
  const empezoHoy = datos.ciclos.some(c => c.startDate === h);

  let sub: string;
  if (est.fase === "menstrual") sub = `Día ${est.diaCiclo} de tu periodo`;
  else if (est.fase === "retraso") sub = `${retraso} ${retraso === 1 ? "día" : "días"} de retraso`;
  else if (est.diasParaPeriodo === 0) sub = "Tu periodo podría llegar hoy";
  else sub = `Periodo en ${est.diasParaPeriodo} ${est.diasParaPeriodo === 1 ? "día" : "días"}`;

  async function hacer(accion: () => Promise<void>, texto: string) {
    setOcupado(true);
    try { await accion(); datos.aviso(texto); }
    catch { datos.aviso("No se pudo guardar. Intenta otra vez."); }
    finally { setOcupado(false); }
  }
  const llegoPeriodo = () => hacer(() => datos.con.nuevoCiclo(h), "Periodo registrado. Cuídate mucho ♡");
  const terminoPeriodo = () => hacer(() => datos.con.actualizarCiclo(est.ciclo.id, { endDate: dif(h, est.inicio) < 0 ? est.inicio : h }), "Listo, anoté que terminó tu periodo");

  const mostrarProb = datos.ajustes.goal !== "track";

  return (
    <div className="vista hoy">
      <header className="saludo">
        <div>
          <p className="fecha-larga">{mayuscula(aDate(h).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" }))}</p>
          <h1>Hola, <em>{nombre}</em></h1>
        </div>
        <div className="logo-luna chico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z" fill="currentColor" /></svg></div>
      </header>

      <div className="semana" role="list" aria-label="Esta semana">
        {semana.map(f => {
          const info = m.get(f);
          const d = aDate(f);
          return (
            <button key={f} type="button" role="listitem" className={`dia-semana ${f === h ? "hoy" : ""} ${info?.marca ?? ""}`} onClick={() => datos.abrirDia(f)} aria-label={bonita(f, { weekday: "long", day: "numeric", month: "long" })}>
              <span className="ds-nombre">{f === h ? "Hoy" : d.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "").slice(0, 3)}</span>
              <span className="ds-num">{d.getDate()}</span>
              {datos.registros[f] && <span className="ds-punto" />}
            </button>
          );
        })}
      </div>

      <section className="tarjeta-anillo">
        <Anillo est={est} st={st}>
          <span className="fase-chip" style={{ color: fase.color }}>{fase.nombre}</span>
          <span className="dia-grande">Día <strong>{est.diaCiclo}</strong></span>
          <span className="sub">{sub}</span>
        </Anillo>

        <div className="acciones-hoy">
          {est.fase === "menstrual" && est.enPeriodoAbierto ? (
            <button className="btn primario" type="button" disabled={ocupado} onClick={terminoPeriodo}><LuCheck /> Terminó mi periodo</button>
          ) : !empezoHoy && (
            <button className="btn primario" type="button" disabled={ocupado} onClick={llegoPeriodo}><LuDroplet /> Me llegó el periodo</button>
          )}
          <button className="btn suave" type="button" onClick={() => datos.abrirDia(h)}>
            <LuPlus /> {reg ? "Editar mi día" : "¿Cómo te sientes hoy?"}
          </button>
        </div>
      </section>

      {reg && (
        <button type="button" className="tarjeta resumen-dia" onClick={() => datos.abrirDia(h)}>
          <h2>Hoy anotaste</h2>
          <div className="chips-mini">
            {reg.mood && <span>{ANIMOS.find(a => a.id === reg.mood)?.emoji} {ANIMOS.find(a => a.id === reg.mood)?.nombre ?? reg.mood}</span>}
            {reg.flow && <span className="rojo">Flujo {reg.flow.toLowerCase()}</span>}
            {(reg.symptoms ?? []).map(s => <span key={s}>{s}</span>)}
            {reg.cervical && <span className="morado">{reg.cervical}</span>}
            {reg.intimate && <span className="azul">♡ Íntimo</span>}
            {reg.notes && <span>📝 Nota</span>}
          </div>
        </button>
      )}

      <div className="datos-rapidos">
        <div className="tarjeta dato">
          <span className="dato-icono periodo"><LuDroplet /></span>
          <span className="dato-titulo">Próximo periodo</span>
          <strong>{est.fase === "retraso" ? "Retrasado" : bonita(est.siguiente, { day: "numeric", month: "short" })}</strong>
          <small>{est.fase === "retraso" ? `Se esperaba el ${bonita(est.siguiente, { day: "numeric", month: "short" })}` : `en ${est.diasParaPeriodo} ${est.diasParaPeriodo === 1 ? "día" : "días"}`}</small>
        </div>
        <div className="tarjeta dato">
          <span className="dato-icono fertil"><LuSparkles /></span>
          <span className="dato-titulo">{vf.proxima ? "Próximos días fértiles" : dif(vf.fertilIni, h) <= 0 ? "Días fértiles (ahora)" : "Días fértiles"}</span>
          <strong>{bonita(vf.fertilIni, { day: "numeric" })}–{bonita(vf.fertilFin, { day: "numeric", month: "short" })}</strong>
          <small>Ovulación ~{bonita(vf.ovulacion, { day: "numeric", month: "short" })}</small>
        </div>
      </div>

      {mostrarProb && est.fase !== "retraso" && (
        <div className={`tarjeta probabilidad p-${est.probabilidad}`}>
          <LuShieldCheck />
          <div>
            <span>Probabilidad de embarazo hoy</span>
            <strong>{est.probabilidad === "alta" ? "Alta" : est.probabilidad === "media" ? "Media" : "Baja"}</strong>
          </div>
        </div>
      )}

      <article className="tarjeta consejo" style={{ ["--acento" as any]: fase.color }}>
        <h2>{tip.titulo}</h2>
        <p>{tip.texto}</p>
      </article>

      <button type="button" className="tarjeta enlace" onClick={() => ir("calendario")}>
        <LuCalendarHeart /> <span>Ver mi calendario</span> <LuChevronRight />
      </button>
    </div>
  );
}
