import { LuHand, LuShovel, LuSprout, LuDroplets, LuWheat, LuArmchair } from "react-icons/lu";
import { CULTIVOS, DECORACIONES, ORDEN_CULTIVOS, ORDEN_DECOR, type CultivoId, type DecorId } from "../datos";
import type { Herramienta } from "../firebase";
import type { EstadoGranja } from "../tipos";
import { duracionBonita } from "../tiempo";
import { Decoracion, Planta } from "./Sprites";

const HERRAMIENTAS: { id: Herramienta; nombre: string; Icono: any }[] = [
  { id: "mano", nombre: "Mano", Icono: LuHand },
  { id: "arar", nombre: "Arar", Icono: LuShovel },
  { id: "sembrar", nombre: "Sembrar", Icono: LuSprout },
  { id: "regar", nombre: "Regar", Icono: LuDroplets },
  { id: "cosechar", nombre: "Cosechar", Icono: LuWheat },
  { id: "decorar", nombre: "Decorar", Icono: LuArmchair },
];

export function Barra({ herr, setHerr, semilla, setSemilla, decor, setDecor, estado, abrirTienda }: {
  herr: Herramienta; setHerr: (h: Herramienta) => void;
  semilla: CultivoId; setSemilla: (c: CultivoId) => void;
  decor: DecorId; setDecor: (d: DecorId) => void;
  estado: EstadoGranja; abrirTienda: () => void;
}) {
  const verSemillas = herr === "sembrar" || herr === "mano";
  const semillas = ORDEN_CULTIVOS.filter(c => (estado.inv.semillas?.[c] ?? 0) > 0 || c === semilla);
  const decors = ORDEN_DECOR.filter(d => (estado.inv.decor?.[d] ?? 0) > 0);

  return (
    <div className="barra-abajo">
      {verSemillas && (
        <div className="selector" role="radiogroup" aria-label="Semilla para sembrar">
          {semillas.map(c => {
            const n = estado.inv.semillas?.[c] ?? 0;
            return (
              <button key={c} type="button" role="radio" aria-checked={semilla === c} className={`opcion ${semilla === c ? "on" : ""} ${n ? "" : "agotada"}`} onClick={() => setSemilla(c)}>
                <span className="mini"><Planta cultivo={c} etapa={3} /></span>
                <span className="op-txt"><b>{CULTIVOS[c].nombre}</b><small>{n} · {duracionBonita(CULTIVOS[c].duracion)}</small></span>
              </button>
            );
          })}
          <button type="button" className="opcion mas" onClick={abrirTienda}>+ Semillas</button>
        </div>
      )}
      {herr === "decorar" && (
        <div className="selector" role="radiogroup" aria-label="Decoración">
          {decors.length ? decors.map(d => (
            <button key={d} type="button" role="radio" aria-checked={decor === d} className={`opcion ${decor === d ? "on" : ""}`} onClick={() => setDecor(d)}>
              <span className="mini"><Decoracion id={d} /></span>
              <span className="op-txt"><b>{DECORACIONES[d].nombre}</b><small>{estado.inv.decor?.[d]}</small></span>
            </button>
          )) : <span className="vacio-sel">Toca una decoración puesta para guardarla, o</span>}
          <button type="button" className="opcion mas" onClick={abrirTienda}>+ Comprar</button>
        </div>
      )}
      <nav className="herramientas" aria-label="Herramientas">
        {HERRAMIENTAS.map(({ id, nombre, Icono }) => (
          <button key={id} type="button" aria-pressed={herr === id} className={herr === id ? "on" : ""} onClick={() => { setHerr(id); if (id === "decorar" && decors.length && !decors.includes(decor)) setDecor(decors[0]); }}>
            <Icono /><span>{nombre}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
