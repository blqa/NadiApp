import { useState } from "react";
import { LuCookingPot, LuGift } from "react-icons/lu";
import type { Mundo } from "../App";
import { CULTIVOS, ORDEN_RECETAS, RECETAS, type CultivoId } from "../datos";
import { Modal } from "../componentes/Modal";
import { Planta } from "../componentes/Sprites";

export function CabanaModal({ mundo, cerrar, irCofre }: { mundo: Mundo; cerrar: () => void; irCofre: () => void }) {
  const { estado, g, hacer } = mundo;
  const [ocupado, setOcupado] = useState<string | null>(null);
  const tiene = (c: CultivoId) => (estado.inv.cosechas?.[c] ?? 0) + (estado.inv.doradas?.[c] ?? 0);

  return (
    <Modal titulo="Cabaña" subtitulo="Conviertan sus cosechas en algo especial" cerrar={cerrar} clase="calida">
      <ul className="recetas">
        {ORDEN_RECETAS.map(r => {
          const rec = RECETAS[r];
          const ing = Object.entries(rec.ingredientes) as [CultivoId, number][];
          const alcanza = ing.every(([c, n]) => tiene(c) >= n);
          const hechos = estado.inv.items?.[r] ?? 0;
          return (
            <li key={r} className={alcanza ? "lista" : ""}>
              <span className="emoji-item grande">{rec.emoji}</span>
              <div className="info">
                <b>{rec.nombre}</b>
                <small>{rec.descripcion}</small>
                <div className="ingredientes">
                  {ing.map(([c, n]) => (
                    <span key={c} className={tiene(c) >= n ? "ok" : "falta"}><i><Planta cultivo={c} etapa={3} /></i>{Math.min(tiene(c), n)}/{n} {CULTIVOS[c].plural.toLowerCase()}</span>
                  ))}
                </div>
                {hechos > 0 && <small className="guardados">Tienen {hechos} guardad{hechos === 1 ? "a" : "as"}</small>}
              </div>
              <button type="button" className="btn primario" disabled={!alcanza || !!ocupado} onClick={async () => { setOcupado(r); await hacer(g.cocinar(r)); setOcupado(null); }}>
                <LuCookingPot /> {ocupado === r ? "…" : "Hacer"}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn suave ancho" onClick={irCofre}><LuGift /> Regalar algo en el cofre</button>
      <p className="nota">Si no alcanzan las normales, se usan las doradas. Lo que hagan se puede vender en la tienda o regalar.</p>
    </Modal>
  );
}
