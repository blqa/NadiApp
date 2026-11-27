import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuStore, LuBookOpen, LuArrowLeft } from "react-icons/lu";
import { conectar, idCasilla, type Granja, type Herramienta, type Resultado } from "./firebase";
import { CULTIVOS, NOMBRE, otro, type CultivoId, type DecorId, type Jugador } from "./datos";
import type { Encargo, EstadoGranja, Mascota, Parcela, Presencia, Regalo } from "./tipos";
import { estaLista, momento, horaCDMX, type Momento } from "./tiempo";
import { Escena } from "./componentes/Escena";
import { Barra } from "./componentes/Barra";
import { Moneda } from "./componentes/Sprites";
import { Tienda } from "./modales/Tienda";
import { CabanaModal } from "./modales/Cabana";
import { CofreModal } from "./modales/Cofre";
import { Herbario } from "./modales/Herbario";
import { TablonModal } from "./modales/Tablon";
import { GatitoModal } from "./modales/Gatito";

export type ModalId = "tienda" | "cabana" | "cofre" | "herbario" | "tablon" | "gatito" | null;

export interface Mundo {
  g: Granja;
  yo: Jugador;
  estado: EstadoGranja;
  parcelas: Record<string, Parcela>;
  cofre: Regalo[];
  encargos: Encargo[];
  jugadores: Partial<Record<Jugador, Presencia>>;
  mascota: Mascota | null;
  ahora: number;
  aviso: (t: string, tipo?: "bien" | "mal" | "oro" | "amor") => void;
  hacer: (p: Promise<Resultado>) => Promise<Resultado | null>;
}

export function App() {
  const [g, setG] = useState<Granja | null>(null);
  const [error, setError] = useState(false);
  const [estado, setEstado] = useState<EstadoGranja | null>(null);
  const [parcelas, setParcelas] = useState<Record<string, Parcela>>({});
  const [cofre, setCofre] = useState<Regalo[]>([]);
  const [encargos, setEncargos] = useState<Encargo[]>([]);
  const [jugadores, setJugadores] = useState<Partial<Record<Jugador, Presencia>>>({});
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [mom, setMom] = useState<Momento>(momento());
  const [herr, setHerr] = useState<Herramienta>("mano");
  const [semilla, setSemilla] = useState<CultivoId>("fresa");
  const [decor, setDecor] = useState<DecorId>("camino");
  const [modal, setModal] = useState<ModalId>(null);
  const [avisoTxt, setAviso] = useState<{ t: string; tipo: string; n: number } | null>(null);
  const [ocupadas, setOcupadas] = useState<Set<string>>(new Set());
  const timer = useRef(0);

  const aviso = useCallback((t: string, tipo: "bien" | "mal" | "oro" | "amor" = "bien") => {
    if (!t) return;
    clearTimeout(timer.current);
    setAviso({ t, tipo, n: Date.now() });
    timer.current = window.setTimeout(() => setAviso(null), 2600);
  }, []);

  const hacer = useCallback(async (p: Promise<Resultado>) => {
    try {
      const r = await p;
      aviso(r.msg, !r.ok ? "mal" : r.dorada ? "oro" : r.amor ? "amor" : "bien");
      return r;
    } catch (e) {
      console.error(e);
      aviso(navigator.onLine ? "No se pudo. Intenta otra vez" : "Sin internet", "mal");
      return null;
    }
  }, [aviso]);

  // Conectar y escuchar todo en tiempo real
  useEffect(() => {
    let quitar = () => {};
    conectar().then(async gr => {
      setG(gr);
      await gr.inicializar().catch(() => {});
      quitar = gr.escuchar({ estado: setEstado, parcelas: setParcelas, cofre: setCofre, encargos: setEncargos, jugadores: setJugadores, mascota: setMascota, error: () => setError(true) });
      gr.presencia({ accion: "llegó a la granja" });
    }).catch(() => setError(true));
    return () => quitar();
  }, []);

  // Reloj del juego (crecimiento, gatito, día/noche)
  useEffect(() => {
    const t = setInterval(() => { setAhora(Date.now()); setMom(momento(horaCDMX())); }, 1000);
    return () => clearInterval(t);
  }, []);

  // Sigo aquí (cada 45 s, solo con la pestaña visible)
  useEffect(() => {
    if (!g) return;
    const t = setInterval(() => { if (!document.hidden) g.presencia({}); }, 45000);
    const vis = () => { if (!document.hidden) g.presencia({}); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [g]);

  const tocarCasilla = useCallback(async (fila: number, col: number) => {
    if (!g) return;
    const id = idCasilla(fila, col);
    if (ocupadas.has(id)) return;
    const p: Parcela = parcelas[id] ?? { estado: "vacia" };
    let h = herr;
    if (h === "mano") {
      // la mano hace lo que sigue
      if (p.estado === "vacia") h = "arar";
      else if (p.estado === "arada") h = "sembrar";
      else if (p.estado === "sembrada") h = "regar";
      else if (p.estado === "regada" && estaLista(p, Date.now())) h = "cosechar";
      else if (p.estado === "regada") h = "regar";
      else if (p.estado === "decoracion") { aviso("Usa la herramienta Decorar para quitarla"); return; }
    }
    setOcupadas(s => new Set(s).add(id));
    const r = await hacer(g.casilla(fila, col, h, { cultivo: semilla, decor }));
    setOcupadas(s => { const n = new Set(s); n.delete(id); return n; });
    if (r?.ok) {
      const verbo = { arar: "aró la tierra", sembrar: `sembró ${CULTIVOS[semilla].nombre.toLowerCase()}`, regar: "regó", cosechar: "cosechó", decorar: "decoró", mano: "" }[h];
      g.presencia({ fila, col, accion: verbo });
      if (navigator.vibrate) try { navigator.vibrate(r.dorada ? [20, 40, 20] : 8); } catch {}
    }
  }, [g, herr, semilla, decor, parcelas, ocupadas, hacer, aviso]);

  const pendientes = useMemo(() => cofre.filter(r => g && r.para === g.yo && !r.abiertoAt).length, [cofre, g]);

  if (error && !estado) return <div className="centro"><h1>No pude abrir la granjita</h1><p>Revisa tu internet y vuelve a intentar.</p><button className="btn primario" onClick={() => location.reload()}>Reintentar</button></div>;
  if (!g || !estado) return <div className="centro cargando"><div className="semillita" /><p>Abriendo la granjita…</p></div>;

  const mundo: Mundo = { g, yo: g.yo, estado, parcelas, cofre, encargos, jugadores, mascota, ahora, aviso, hacer };
  const pareja = jugadores[otro(g.yo)];
  const enLinea = pareja && ahora - pareja.vistoAt < 120_000;

  return (
    <div className={`juego momento-${mom}`}>
      <header className="cabeza">
        <a className="volver" href="./" aria-label="Volver a NadiApp"><LuArrowLeft /></a>
        <div className="titulo">
          <h1>Granjita</h1>
          <p className="estado-pareja">
            <i className={enLinea ? "punto on" : "punto"} />
            {pareja ? (enLinea ? `${NOMBRE[otro(g.yo)]} está aquí${pareja.accion ? " · " + pareja.accion : ""}` : `${NOMBRE[otro(g.yo)]} vino ${hace(pareja.vistoAt, ahora)}`) : `${NOMBRE[otro(g.yo)]} todavía no viene`}
          </p>
        </div>
        <div className="monedas" aria-label={`${estado.monedas} moneditas`}><Moneda /> {estado.monedas}</div>
        <button className="icono-btn" type="button" onClick={() => setModal("herbario")} aria-label="Herbario"><LuBookOpen /></button>
        <button className="icono-btn" type="button" onClick={() => setModal("tienda")} aria-label="Tienda"><LuStore /></button>
      </header>

      <Escena mundo={mundo} momento={mom} ocupadas={ocupadas} pendientesCofre={pendientes} abrir={setModal} tocar={tocarCasilla} herramienta={herr} />

      <Barra herr={herr} setHerr={setHerr} semilla={semilla} setSemilla={setSemilla} decor={decor} setDecor={setDecor} estado={estado} abrirTienda={() => setModal("tienda")} />

      {modal === "tienda" && <Tienda mundo={mundo} cerrar={() => setModal(null)} />}
      {modal === "cabana" && <CabanaModal mundo={mundo} cerrar={() => setModal(null)} irCofre={() => setModal("cofre")} />}
      {modal === "cofre" && <CofreModal mundo={mundo} cerrar={() => setModal(null)} />}
      {modal === "herbario" && <Herbario mundo={mundo} cerrar={() => setModal(null)} />}
      {modal === "tablon" && <TablonModal mundo={mundo} cerrar={() => setModal(null)} />}
      {modal === "gatito" && <GatitoModal mundo={mundo} cerrar={() => setModal(null)} />}

      <div className="avisos" role="status" aria-live="polite">
        {avisoTxt && <div key={avisoTxt.n} className={`aviso ${avisoTxt.tipo}`}>{avisoTxt.t}</div>}
      </div>
    </div>
  );
}

export function hace(t: number, ahora = Date.now()) {
  const m = Math.round((ahora - t) / 60000);
  if (m < 2) return "hace un momento";
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}
