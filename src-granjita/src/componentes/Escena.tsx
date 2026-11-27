import { useMemo } from "react";
import type { Mundo, ModalId } from "../App";
import { CULTIVOS, DECORACIONES, NOMBRE, otro, type Jugador } from "../datos";
import { idCasilla, type Herramienta } from "../firebase";
import type { Parcela } from "../tipos";
import { duracionBonita, estaLista, faltante, progreso, type Momento } from "../tiempo";
import { Avatar, Cabana, Cofre, Decoracion, Gato, Planta, Tablon } from "./Sprites";

const PASO_GATO = 9000;
// número "al azar" pero igual para los dos (depende solo del tiempo)
const hash = (n: number) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };

export function Escena({ mundo, momento, ocupadas, pendientesCofre, abrir, tocar, herramienta }: {
  mundo: Mundo; momento: Momento; ocupadas: Set<string>; pendientesCofre: number;
  abrir: (m: ModalId) => void; tocar: (f: number, c: number) => void; herramienta: Herramienta;
}) {
  const { estado, parcelas, ahora, jugadores, yo, encargos, mascota } = mundo;
  const n = estado.tamano;
  const noche = momento === "noche";
  const luz = noche || momento === "atardecer";

  // El gatito: cambia de lugar cada 9 s (los dos lo ven en el mismo lugar)
  const paso = Math.floor(ahora / PASO_GATO);
  const gato = useMemo(() => {
    const pos = (k: number) => ({ x: (hash(k) * 0.86 + 0.07) * 100, y: (hash(k + 7777) * 0.8 + 0.12) * 100 });
    const a = pos(paso - 1), b = pos(paso);
    return { ...b, dir: (b.x >= a.x ? 1 : -1) as 1 | -1 };
  }, [paso]);
  const sentado = ahora % PASO_GATO > 3600;

  const pendientes = encargos.filter(e => !e.hechoPor).length;
  const luciernagas = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: hash(i + 11) * 100, y: hash(i + 99) * 100, d: 4 + hash(i + 5) * 6, r: hash(i + 3) * 6 })), []);
  const nubes = useMemo(() => Array.from({ length: 3 }, (_, i) => ({ y: 6 + hash(i + 40) * 30, d: 70 + hash(i + 50) * 60, r: hash(i + 60) * 100, w: 60 + hash(i + 70) * 50 })), []);

  const presencia = (j: Jugador) => {
    const p = jugadores[j];
    if (!p || p.fila == null || p.col == null) return null;
    if (j !== yo && ahora - p.vistoAt > 120_000) return null;
    return { fila: p.fila, col: p.col, accion: p.accion };
  };
  const pa = presencia(otro(yo)), mia = presencia(yo);

  return (
    <main className="escena">
      <div className="cielo" aria-hidden="true">
        {nubes.map((c, i) => <span key={i} className="nube" style={{ top: `${c.y}%`, width: c.w, animationDuration: `${c.d}s`, animationDelay: `-${c.r}s` }} />)}
        <span className="astro" />
        {noche && <div className="estrellas">{luciernagas.map((l, i) => <i key={i} style={{ left: `${l.x}%`, top: `${l.y * 0.5}%`, animationDelay: `${l.r}s` }} />)}</div>}
      </div>

      <div className="patio">
        <button type="button" className="lugar cabana-btn" onClick={() => abrir("cabana")} aria-label="Cabaña: cocinar y crear regalos">
          <Cabana luz={luz} /><span className="etiqueta">Cabaña</span>
        </button>
        <button type="button" className="lugar" onClick={() => abrir("tablon")} aria-label={`Tablón de encargos, ${pendientes} pendientes`}>
          <Tablon pendientes={pendientes} /><span className="etiqueta">Encargos</span>
        </button>
        <button type="button" className="lugar" onClick={() => abrir("cofre")} aria-label={`Cofre compartido, ${pendientesCofre} regalos nuevos`}>
          <Cofre nuevos={pendientesCofre} /><span className="etiqueta">Cofre</span>
        </button>
      </div>

      <div className={`terreno herr-${herramienta}`} style={{ ["--n" as any]: n }}>
        <div className="rejilla" role="grid" aria-label={`Terreno de ${n} por ${n}`}>
          {Array.from({ length: n * n }, (_, i) => {
            const fila = Math.floor(i / n), col = i % n;
            const id = idCasilla(fila, col);
            const p: Parcela = parcelas[id] ?? { estado: "vacia" };
            return <Casilla key={id} p={p} ahora={ahora} ocupada={ocupadas.has(id)} onClick={() => tocar(fila, col)}
              pareja={pa && pa.fila === fila && pa.col === col ? otro(yo) : null}
              yo={mia && mia.fila === fila && mia.col === col && !(pa && pa.fila === fila && pa.col === col) ? yo : null} />;
          })}
        </div>
        <button type="button" className={`gatito ${sentado ? "quieto" : ""}`} style={{ left: `${gato.x}%`, top: `${gato.y}%` }} onClick={() => abrir("gatito")} aria-label={`${mascota?.nombre ?? "Michi"}, el gatito`}>
          <Gato sentado={sentado} dir={gato.dir} />
          {mascota && mascota.carino >= 60 && sentado && <span className="corazoncito">♡</span>}
        </button>
        {noche && <div className="luciernagas" aria-hidden="true">{luciernagas.map((l, i) => <i key={i} style={{ left: `${l.x}%`, top: `${l.y}%`, animationDuration: `${l.d}s`, animationDelay: `-${l.r}s` }} />)}</div>}
      </div>
      {pa?.accion && <p className="burbuja-pareja" aria-live="polite">{NOMBRE[otro(yo)]} {pa.accion}</p>}
    </main>
  );
}

function Casilla({ p, ahora, ocupada, onClick, pareja, yo }: { p: Parcela; ahora: number; ocupada: boolean; onClick: () => void; pareja: Jugador | null; yo: Jugador | null }) {
  const lista = p.cultivo ? estaLista(p, ahora) : false;
  const prog = progreso(p, ahora);
  const etapa: 0 | 1 | 2 | 3 = !p.cultivo ? 0 : p.estado === "sembrada" ? 0 : lista ? 3 : prog < 0.4 ? 1 : 2;
  const regada = p.estado === "regada" && !lista;
  const clases = ["casilla", p.estado, regada ? "mojada" : "", p.amor ? "amor" : "", lista ? "lista" : "", ocupada ? "ocupada" : ""].join(" ");
  let etiqueta = "Tierra vacía";
  if (p.estado === "arada") etiqueta = "Tierra arada";
  if (p.estado === "decoracion" && p.decor) etiqueta = DECORACIONES[p.decor].nombre;
  if (p.cultivo) {
    const c = CULTIVOS[p.cultivo].nombre;
    etiqueta = p.estado === "sembrada" ? `${c}, sembrada, falta regar` : lista ? `${c}, lista para cosechar` : `${c}, faltan ${duracionBonita(faltante(p, ahora))}${p.amor ? ", con Amor Compartido" : ""}`;
  }
  return (
    <button type="button" role="gridcell" className={clases} onClick={onClick} aria-label={etiqueta} title={etiqueta}>
      {p.estado === "decoracion" && p.decor && <Decoracion id={p.decor} />}
      {p.cultivo && <Planta cultivo={p.cultivo} etapa={etapa} />}
      {p.estado === "sembrada" && <span className="gota-falta" aria-hidden="true">💧</span>}
      {regada && <span className="barrita" aria-hidden="true"><i style={{ width: `${Math.max(4, prog * 100)}%` }} /></span>}
      {p.amor && !lista && <span className="brillo-amor" aria-hidden="true">♡</span>}
      {lista && <span className="destellos" aria-hidden="true"><i /><i /><i /></span>}
      {pareja && <span className="quien pareja"><Avatar quien={pareja} chico /></span>}
      {yo && <span className="quien yo"><Avatar quien={yo} chico /></span>}
    </button>
  );
}
