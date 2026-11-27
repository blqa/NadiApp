import { LuLock } from "react-icons/lu";
import type { Mundo } from "../App";
import { CULTIVOS, ORDEN_CULTIVOS, ORDEN_RECETAS, RECETAS } from "../datos";
import { duracionBonita } from "../tiempo";
import { Modal } from "../componentes/Modal";
import { Planta } from "../componentes/Sprites";

export function Herbario({ mundo, cerrar }: { mundo: Mundo; cerrar: () => void }) {
  const { estado } = mundo;
  const total = ORDEN_CULTIVOS.length * 2 + ORDEN_RECETAS.length;
  const tienen = ORDEN_CULTIVOS.reduce((s, c) => s + (estado.herbario?.[c]?.normal ? 1 : 0) + (estado.herbario?.[c]?.dorada ? 1 : 0), 0)
    + ORDEN_RECETAS.filter(r => estado.recetas?.[r]).length;

  return (
    <Modal titulo="Herbario" subtitulo={`${tienen} de ${total} descubiertos`} cerrar={cerrar} clase="papel">
      <div className="progreso-album"><i style={{ width: `${(tienen / total) * 100}%` }} /></div>
      <h3>Cultivos</h3>
      <div className="album">
        {ORDEN_CULTIVOS.flatMap(c => (["normal", "dorada"] as const).map(t => {
          const n = estado.herbario?.[c]?.[t] ?? 0;
          return (
            <div key={c + t} className={`carta ${n ? "" : "bloqueada"} ${t}`}>
              <span className="dib">{n ? <Planta cultivo={c} etapa={3} oro={t === "dorada"} /> : <LuLock />}</span>
              <b>{n ? `${CULTIVOS[c].nombre}${t === "dorada" ? " dorada" : ""}` : "???"}</b>
              <small>{n ? `Cosechadas: ${n}` : t === "dorada" ? "Prueben el Amor Compartido" : duracionBonita(CULTIVOS[c].duracion)}</small>
            </div>
          );
        }))}
      </div>
      <h3>Recetas</h3>
      <div className="album">
        {ORDEN_RECETAS.map(r => {
          const n = estado.recetas?.[r] ?? 0;
          return (
            <div key={r} className={`carta ${n ? "" : "bloqueada"}`}>
              <span className="dib emoji-item grande">{n ? RECETAS[r].emoji : <LuLock />}</span>
              <b>{n ? RECETAS[r].nombre : "???"}</b>
              <small>{n ? `Hechas: ${n}` : "Se descubre en la cabaña"}</small>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
