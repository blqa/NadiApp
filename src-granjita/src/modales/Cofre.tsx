import { useMemo, useState } from "react";
import { LuGift, LuSend } from "react-icons/lu";
import { hace, type Mundo } from "../App";
import { CULTIVOS, NOMBRE, ORDEN_CULTIVOS, ORDEN_RECETAS, RECETAS, otro } from "../datos";
import type { Regalo } from "../tipos";
import { Modal, Pestanas } from "../componentes/Modal";
import { Planta } from "../componentes/Sprites";

type Tab = "recibidos" | "regalar" | "historial";

function nombreRegalo(r: Pick<Regalo, "tipo" | "clave" | "cantidad">) {
  if (r.tipo === "item") return `${RECETAS[r.clave as keyof typeof RECETAS].emoji} ${RECETAS[r.clave as keyof typeof RECETAS].nombre}`;
  const c = CULTIVOS[r.clave as keyof typeof CULTIVOS];
  return `${r.cantidad} ${r.cantidad === 1 ? c.nombre : c.plural}${r.tipo === "dorada" ? (r.cantidad === 1 ? " dorada" : " doradas") : ""}`;
}

export function CofreModal({ mundo, cerrar }: { mundo: Mundo; cerrar: () => void }) {
  const { estado, g, hacer, cofre, yo, ahora } = mundo;
  const nuevos = cofre.filter(r => r.para === yo && !r.abiertoAt);
  const [tab, setTab] = useState<Tab>(nuevos.length ? "recibidos" : "regalar");
  const [sel, setSel] = useState<string>("");
  const [cant, setCant] = useState(1);
  const [nota, setNota] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const opciones = useMemo(() => [
    ...ORDEN_RECETAS.map(r => ({ k: `item:${r}`, tipo: "item" as const, clave: r, n: estado.inv.items?.[r] ?? 0, nombre: `${RECETAS[r].emoji} ${RECETAS[r].nombre}`, dib: null })),
    ...ORDEN_CULTIVOS.map(c => ({ k: `dorada:${c}`, tipo: "dorada" as const, clave: c, n: estado.inv.doradas?.[c] ?? 0, nombre: `${CULTIVOS[c].nombre} dorada`, dib: <Planta cultivo={c} etapa={3} oro /> })),
    ...ORDEN_CULTIVOS.map(c => ({ k: `cosecha:${c}`, tipo: "cosecha" as const, clave: c, n: estado.inv.cosechas?.[c] ?? 0, nombre: CULTIVOS[c].nombre, dib: <Planta cultivo={c} etapa={3} /> })),
  ].filter(o => o.n > 0), [estado.inv]);
  const elegido = opciones.find(o => o.k === sel) ?? null;

  async function enviar() {
    if (!elegido) return;
    setOcupado(true);
    const r = await hacer(g.regalar(elegido.tipo, elegido.clave, Math.min(cant, elegido.n), nota));
    setOcupado(false);
    if (r?.ok) { setSel(""); setNota(""); setCant(1); setTab("historial"); }
  }

  return (
    <Modal titulo="Cofre compartido" subtitulo={`Regalitos entre ${NOMBRE.nadia} y ${NOMBRE.luis}`} cerrar={cerrar} clase="calida">
      <Pestanas<Tab> opciones={[["recibidos", `Para ti${nuevos.length ? ` (${nuevos.length})` : ""}`], ["regalar", "Regalar"], ["historial", "Recuerdos"]]} valor={tab} cambiar={setTab} />

      {tab === "recibidos" && (nuevos.length ? (
        <ul className="regalos">
          {nuevos.map(r => (
            <li key={r.id} className="regalo nuevo">
              <span className="moño"><LuGift /></span>
              <div className="info">
                <small>De {NOMBRE[r.de]} · {hace(r.creadoAt, ahora)}</small>
                <b>{nombreRegalo(r)}</b>
                {r.nota && <p className="notita">“{r.nota}”</p>}
              </div>
              <button type="button" className="btn primario" disabled={ocupado} onClick={async () => { setOcupado(true); await hacer(g.abrirRegalo(r.id)); setOcupado(false); }}>Abrir</button>
            </li>
          ))}
        </ul>
      ) : <p className="vacio">No hay regalos nuevos. Quizás pronto… ♡</p>)}

      {tab === "regalar" && (opciones.length ? (
        <div className="form-regalo">
          <p className="nota">Elige algo para {NOMBRE[otro(yo)]}:</p>
          <div className="opciones-regalo" role="radiogroup">
            {opciones.map(o => (
              <button key={o.k} type="button" role="radio" aria-checked={sel === o.k} className={sel === o.k ? "on" : ""} onClick={() => { setSel(o.k); setCant(1); }}>
                {o.dib && <i>{o.dib}</i>}<span>{o.nombre}</span><small>×{o.n}</small>
              </button>
            ))}
          </div>
          {elegido && elegido.tipo !== "item" && elegido.n > 1 && (
            <label className="cantidad">Cuántas
              <input type="range" min={1} max={elegido.n} value={cant} onChange={e => setCant(Number(e.target.value))} /><b>{cant}</b>
            </label>
          )}
          <textarea className="campo" maxLength={140} rows={2} placeholder={`Una notita para ${NOMBRE[otro(yo)]}…`} value={nota} onChange={e => setNota(e.target.value)} />
          <button type="button" className="btn primario ancho" disabled={!elegido || ocupado} onClick={enviar}><LuSend /> Guardar en el cofre</button>
        </div>
      ) : <p className="vacio">Cosechen o cocinen algo para poder regalarlo.</p>)}

      {tab === "historial" && (cofre.length ? (
        <ul className="regalos">
          {cofre.slice(0, 30).map(r => (
            <li key={r.id} className={`regalo ${r.de === yo ? "mio" : ""}`}>
              <span className="moño"><LuGift /></span>
              <div className="info">
                <small>{r.de === yo ? `Para ${NOMBRE[r.para]}` : `De ${NOMBRE[r.de]}`} · {hace(r.creadoAt, ahora)} · {r.abiertoAt ? "abierto" : "sin abrir"}</small>
                <b>{nombreRegalo(r)}</b>
                {r.nota && <p className="notita">“{r.nota}”</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="vacio">Aquí se guardarán todos sus regalitos.</p>)}
    </Modal>
  );
}
