import { useState } from "react";
import { LuHeart, LuFish } from "react-icons/lu";
import type { Mundo } from "../App";
import { GATITO, NOMBRE, otro } from "../datos";
import { diaCDMX } from "../tiempo";
import { Modal } from "../componentes/Modal";
import { Gato } from "../componentes/Sprites";

function nivel(c: number) {
  if (c >= 90) return "Te adora";
  if (c >= 60) return "Muy cariñoso";
  if (c >= 30) return "Amigable";
  return "Un poco tímido";
}

export function GatitoModal({ mundo, cerrar }: { mundo: Mundo; cerrar: () => void }) {
  const { mascota, g, hacer, yo } = mundo;
  const [ocupado, setOcupado] = useState(false);
  const [mimo, setMimo] = useState(0);
  const m = mascota ?? { nombre: GATITO.nombre, carino: 0, caricias: {}, comidas: {} };
  const hoy = diaCDMX();
  const acaricie = m.caricias?.[yo] === hoy, comio = m.comidas?.[yo] === hoy;
  const parejaHoy = [m.caricias?.[otro(yo)] === hoy && "lo acarició", m.comidas?.[otro(yo)] === hoy && "le dio de comer"].filter(Boolean).join(" y ");

  const correr = async (a: "caricia" | "comida") => {
    setOcupado(true);
    const r = await hacer(g.gatito(a));
    if (r?.ok) setMimo(Date.now());
    setOcupado(false);
  };

  return (
    <Modal titulo={m.nombre} subtitulo={nivel(m.carino)} cerrar={cerrar} clase="calida">
      <div className="gato-grande">
        <Gato sentado />
        {mimo > 0 && <span key={mimo} className="corazones-sube"><i>♡</i><i>♡</i><i>♡</i></span>}
      </div>
      <div className="carino">
        <span>Cariño</span>
        <div className="barra-carino"><i style={{ width: `${m.carino}%` }} /></div>
        <b>{m.carino}/100</b>
      </div>
      <div className="acciones-gato">
        <button type="button" className="btn suave" disabled={ocupado || acaricie} onClick={() => correr("caricia")}><LuHeart /> {acaricie ? "Ya lo acariciaste" : "Acariciar"}</button>
        <button type="button" className="btn primario" disabled={ocupado || comio} onClick={() => correr("comida")}><LuFish /> {comio ? "Ya comió contigo" : "Darle de comer"}</button>
      </div>
      {parejaHoy && <p className="nota">Hoy {NOMBRE[otro(yo)]} {parejaHoy} ♡</p>}
      {m.hallazgo && Date.now() - m.hallazgo.at < 86_400_000 && <p className="nota">Último hallazgo: una semilla rara para {NOMBRE[m.hallazgo.para]}.</p>}
      <p className="nota">Cada quien puede acariciarlo y darle de comer una vez al día. Cuando come, a veces encuentra semillas raras; mientras más cariño, más seguido.</p>
    </Modal>
  );
}
