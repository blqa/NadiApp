import { useState } from "react";
import { LuCheck, LuTrash2, LuPlus } from "react-icons/lu";
import { hace, type Mundo } from "../App";
import { NOMBRE } from "../datos";
import { Modal } from "../componentes/Modal";

const IDEAS = ["Necesito 3 lavandas para un ramo", "¿Me ayudas a regar las fresas?", "Siembra calabazas, quiero hacer pay", "Dale de comer a Michi porfa"];

export function TablonModal({ mundo, cerrar }: { mundo: Mundo; cerrar: () => void }) {
  const { encargos, g, yo, ahora, aviso } = mundo;
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const pendientes = encargos.filter(e => !e.hechoPor);
  const hechos = encargos.filter(e => e.hechoPor).slice(0, 8);

  async function publicar() {
    if (!texto.trim()) return;
    setOcupado(true);
    try { await g.nuevoEncargo(texto); setTexto(""); aviso("Encargo en el tablón"); } catch { aviso("No se pudo publicar", "mal"); }
    setOcupado(false);
  }

  return (
    <Modal titulo="Tablón de encargos" subtitulo="Pídanse cosas o déjense recaditos" cerrar={cerrar} clase="madera">
      <form className="nuevo-encargo" onSubmit={e => { e.preventDefault(); publicar(); }}>
        <input className="campo" maxLength={90} placeholder={IDEAS[new Date().getMinutes() % IDEAS.length]} value={texto} onChange={e => setTexto(e.target.value)} />
        <button type="submit" className="btn primario" disabled={!texto.trim() || ocupado} aria-label="Publicar"><LuPlus /></button>
      </form>
      {pendientes.length ? (
        <ul className="notas-tablon">
          {pendientes.map((e, i) => (
            <li key={e.id} className={`papelito ${e.de}`} style={{ ["--giro" as any]: `${(i % 3 - 1) * 1.6}deg` }}>
              <p>{e.texto}</p>
              <small>{NOMBRE[e.de]} · {hace(e.creadoAt, ahora)}</small>
              <div className="acciones-papel">
                {e.de !== yo && <button type="button" onClick={() => g.cumplirEncargo(e.id).then(() => aviso("¡Encargo cumplido! ♡"))} aria-label="Marcar como hecho"><LuCheck /> Hecho</button>}
                {e.de === yo && <button type="button" onClick={() => g.borrarEncargo(e.id)} aria-label="Quitar encargo"><LuTrash2 /></button>}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="vacio">El tablón está vacío.</p>}
      {hechos.length > 0 && <>
        <h3>Cumplidos</h3>
        <ul className="hechos">{hechos.map(e => <li key={e.id}><LuCheck /> <s>{e.texto}</s> <small>por {NOMBRE[e.hechoPor!]}</small></li>)}</ul>
      </>}
    </Modal>
  );
}
