import { useState } from "react";
import type { Mundo } from "../App";
import { CULTIVOS, DECORACIONES, MULT_DORADA, ORDEN_CULTIVOS, ORDEN_DECOR, ORDEN_RECETAS, RECETAS, TAMANO_MAX, precioExpansion } from "../datos";
import { duracionBonita } from "../tiempo";
import { Modal, Pestanas } from "../componentes/Modal";
import { Decoracion, Moneda, Planta } from "../componentes/Sprites";

type Tab = "semillas" | "decor" | "terreno" | "vender";

export function Tienda({ mundo, cerrar }: { mundo: Mundo; cerrar: () => void }) {
  const { estado, g, hacer } = mundo;
  const [tab, setTab] = useState<Tab>("semillas");
  const [ocupado, setOcupado] = useState(false);
  const correr = async (p: Promise<any>) => { setOcupado(true); await hacer(p); setOcupado(false); };
  const precioTerreno = precioExpansion(estado.tamano);

  const vendibles = [
    ...ORDEN_CULTIVOS.map(c => ({ tipo: "cosecha" as const, clave: c, nombre: CULTIVOS[c].nombre, n: estado.inv.cosechas?.[c] ?? 0, precio: CULTIVOS[c].venta, dib: <Planta cultivo={c} etapa={3} /> })),
    ...ORDEN_CULTIVOS.map(c => ({ tipo: "dorada" as const, clave: c, nombre: `${CULTIVOS[c].nombre} dorada`, n: estado.inv.doradas?.[c] ?? 0, precio: CULTIVOS[c].venta * MULT_DORADA, dib: <Planta cultivo={c} etapa={3} oro /> })),
    ...ORDEN_RECETAS.map(r => ({ tipo: "item" as const, clave: r, nombre: RECETAS[r].nombre, n: estado.inv.items?.[r] ?? 0, precio: RECETAS[r].venta, dib: <span className="emoji-item">{RECETAS[r].emoji}</span> })),
  ].filter(x => x.n > 0);

  return (
    <Modal titulo="Tienda" subtitulo={`Tienen ${estado.monedas} moneditas`} cerrar={cerrar}>
      <Pestanas<Tab> opciones={[["semillas", "Semillas"], ["decor", "Decoración"], ["terreno", "Terreno"], ["vender", "Vender"]]} valor={tab} cambiar={setTab} />

      {tab === "semillas" && (
        <ul className="lista-tienda">
          {ORDEN_CULTIVOS.map(c => {
            const k = CULTIVOS[c];
            return (
              <li key={c}>
                <span className="dibujo"><Planta cultivo={c} etapa={3} /></span>
                <div className="info"><b>{k.nombre}{k.rara && <em className="rara">rara</em>}</b><small>Crece en {duracionBonita(k.duracion)} · se vende en {k.venta}</small><small>Tienen {estado.inv.semillas?.[c] ?? 0}</small></div>
                <div className="compras">
                  <button type="button" className="btn-precio" disabled={ocupado || estado.monedas < k.semilla} onClick={() => correr(g.comprar("semilla", c, 1))}><Moneda />{k.semilla}</button>
                  {!k.rara && <button type="button" className="btn-precio x5" disabled={ocupado || estado.monedas < k.semilla * 5} onClick={() => correr(g.comprar("semilla", c, 5))}>×5</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "decor" && (
        <ul className="lista-tienda">
          {ORDEN_DECOR.map(d => (
            <li key={d}>
              <span className="dibujo"><Decoracion id={d} /></span>
              <div className="info"><b>{DECORACIONES[d].nombre}</b><small>Tienen {estado.inv.decor?.[d] ?? 0} guardadas</small></div>
              <button type="button" className="btn-precio" disabled={ocupado || estado.monedas < DECORACIONES[d].precio} onClick={() => correr(g.comprar("decor", d))}><Moneda />{DECORACIONES[d].precio}</button>
            </li>
          ))}
          <p className="nota">Para ponerla: herramienta <b>Decorar</b> y toca una casilla libre.</p>
        </ul>
      )}

      {tab === "terreno" && (
        <div className="terreno-tienda">
          <div className="mini-terreno" style={{ ["--n" as any]: Math.min(TAMANO_MAX, estado.tamano + 1) }}>
            {Array.from({ length: Math.min(TAMANO_MAX, estado.tamano + 1) ** 2 }, (_, i) => {
              const n = Math.min(TAMANO_MAX, estado.tamano + 1), f = Math.floor(i / n), c = i % n;
              return <i key={i} className={f < estado.tamano && c < estado.tamano ? "suya" : "nueva"} />;
            })}
          </div>
          {estado.tamano >= TAMANO_MAX ? <p>Su terreno ya es del tamaño máximo ({TAMANO_MAX}×{TAMANO_MAX}). ¡Qué granjota!</p> : <>
            <p>Ahora es de <b>{estado.tamano}×{estado.tamano}</b>. Amplíenlo a <b>{estado.tamano + 1}×{estado.tamano + 1}</b> para tener {2 * estado.tamano + 1} casillas más.</p>
            <button type="button" className="btn primario ancho" disabled={ocupado || estado.monedas < precioTerreno} onClick={() => correr(g.comprar("terreno"))}><Moneda /> Ampliar por {precioTerreno}</button>
          </>}
        </div>
      )}

      {tab === "vender" && (
        vendibles.length ? (
          <ul className="lista-tienda">
            {vendibles.map(v => (
              <li key={v.tipo + v.clave}>
                <span className="dibujo">{v.dib}</span>
                <div className="info"><b>{v.nombre}</b><small>Tienen {v.n} · {v.precio} c/u</small></div>
                <div className="compras">
                  <button type="button" className="btn-precio vender" disabled={ocupado} onClick={() => correr(g.vender(v.tipo, v.clave, 1))}>+{v.precio}</button>
                  {v.n > 1 && <button type="button" className="btn-precio vender x5" disabled={ocupado} onClick={() => correr(g.vender(v.tipo, v.clave, v.n))}>Todo</button>}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="vacio">Todavía no hay nada para vender. ¡A cosechar!</p>
      )}
    </Modal>
  );
}
