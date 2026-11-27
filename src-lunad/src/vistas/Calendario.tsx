import { useMemo, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuHeart } from "react-icons/lu";
import { useEstado, type Datos } from "../App";
import { aFecha, bonita, hoy, marcas, partes, mayuscula, type Fecha } from "../ciclo";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

export function Calendario({ datos }: { datos: Datos }) {
  const h = hoy();
  const { st } = useEstado(datos);
  const [mes, setMes] = useState(() => { const p = partes(h); return { y: p.y, m: p.m }; });
  const [dir, setDir] = useState(0);
  const toque = useRef<number | null>(null);

  const mover = (n: number) => {
    setDir(n);
    setMes(({ y, m }) => { const t = new Date(y, m + n, 1); return { y: t.getFullYear(), m: t.getMonth() }; });
  };

  const { celdas, info, delMes } = useMemo(() => {
    const primero = new Date(mes.y, mes.m, 1);
    const vacios = (primero.getDay() + 6) % 7; // semana empieza en lunes
    const total = new Date(mes.y, mes.m + 1, 0).getDate();
    const desde = aFecha(mes.y, mes.m, 1), hasta = aFecha(mes.y, mes.m, total);
    const info = marcas(datos.ciclos, st, desde, hasta);
    const celdas: (Fecha | null)[] = [...Array(vacios).fill(null), ...Array.from({ length: total }, (_, i) => aFecha(mes.y, mes.m, i + 1))];
    // resumen del mes
    const delMes: { f: Fecha; texto: string; tipo: string }[] = [];
    let previo = "";
    celdas.forEach(f => {
      if (!f) return;
      const i = info.get(f);
      if (i?.inicio) delMes.push({ f, texto: "Empezó tu periodo", tipo: "periodo" });
      else if (i?.marca === "previsto" && previo !== "previsto") delMes.push({ f, texto: "Periodo previsto", tipo: "previsto" });
      else if (i?.marca === "ovulacion") delMes.push({ f, texto: "Ovulación estimada", tipo: "ovulacion" });
      else if (i?.marca === "fertil" && previo !== "fertil" && previo !== "ovulacion") delMes.push({ f, texto: "Empiezan días fértiles", tipo: "fertil" });
      previo = i?.marca ?? "";
    });
    return { celdas, info, delMes };
  }, [mes, datos.ciclos, st]);

  const titulo = mayuscula(new Date(mes.y, mes.m, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" }));
  const esMesActual = partes(h).y === mes.y && partes(h).m === mes.m;

  return (
    <div className="vista calendario">
      <header className="cabeza-vista">
        <h1>Calendario</h1>
        {!esMesActual && <button type="button" className="btn chico" onClick={() => { const p = partes(h); setDir(0); setMes({ y: p.y, m: p.m }); }}>Hoy</button>}
      </header>

      <section className="tarjeta mes"
        onTouchStart={e => { toque.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current; toque.current = null;
          if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
        }}>
        <div className="mes-cabeza">
          <button type="button" className="btn-icono" onClick={() => mover(-1)} aria-label="Mes anterior"><LuChevronLeft /></button>
          <h2>{titulo}</h2>
          <button type="button" className="btn-icono" onClick={() => mover(1)} aria-label="Mes siguiente"><LuChevronRight /></button>
        </div>
        <div className="rejilla dias-nombre" aria-hidden="true">{DIAS.map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className={`rejilla dias anim-${dir}`} key={`${mes.y}-${mes.m}`} role="grid">
          {celdas.map((f, i) => {
            if (!f) return <span key={"v" + i} />;
            const inf = info.get(f);
            const reg = datos.registros[f];
            return (
              <button key={f} type="button" role="gridcell"
                className={`celda ${inf?.marca ?? ""} ${inf?.inicio ? "inicio" : ""} ${f === h ? "hoy" : ""} ${f > h ? "futuro" : ""}`}
                onClick={() => datos.abrirDia(f)}
                aria-label={`${bonita(f, { weekday: "long", day: "numeric", month: "long" })}${inf?.marca ? ", " + ({ periodo: "periodo", previsto: "periodo previsto", fertil: "día fértil", ovulacion: "ovulación" } as any)[inf.marca] : ""}`}>
                <span className="num">{partes(f).d}</span>
                <span className="indicadores">
                  {reg?.intimate && <LuHeart className="i-corazon" />}
                  {(reg?.mood || reg?.symptoms?.length || reg?.notes || reg?.cervical) && <i className="i-punto" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="leyenda">
        <span><i className="l-periodo" /> Periodo</span>
        <span><i className="l-previsto" /> Previsto</span>
        <span><i className="l-fertil" /> Fértil</span>
        <span><i className="l-ovulacion" /> Ovulación</span>
      </div>

      {delMes.length > 0 && (
        <section className="tarjeta lista-mes">
          <h2>Este mes</h2>
          <ul>
            {delMes.map(x => (
              <li key={x.f + x.tipo}>
                <i className={`l-${x.tipo}`} />
                <span>{x.texto}</span>
                <time>{mayuscula(bonita(x.f, { weekday: "short", day: "numeric" }))}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="nota-pie">Toca cualquier día para registrar o cambiar algo. Desliza para cambiar de mes.</p>
    </div>
  );
}
