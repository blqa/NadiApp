import { useEffect, useMemo, useState, useCallback } from "react";
import { LuHouse, LuCalendarDays, LuChartColumn, LuSlidersHorizontal, LuWifiOff } from "react-icons/lu";
import { conectar, type Conexion } from "./firebase";
import { AJUSTES_BASE, estadisticas, estadoDe, hoy, ordenar, type Ajustes, type Ciclo, type Fecha, type Registro } from "./ciclo";
import { Hoy } from "./vistas/Hoy";
import { Calendario } from "./vistas/Calendario";
import { Analisis } from "./vistas/Analisis";
import { AjustesVista } from "./vistas/Ajustes";
import { Bienvenida } from "./vistas/Bienvenida";
import { HojaRegistro } from "./componentes/HojaRegistro";
import { Toast, useToast } from "./componentes/Toast";

export type Pestana = "hoy" | "calendario" | "analisis" | "ajustes";

export interface Datos {
  con: Conexion;
  ajustes: Ajustes;
  ciclos: Ciclo[];        // del más viejo al más nuevo
  registros: Record<Fecha, Registro>;
  aviso: (t: string) => void;
  abrirDia: (f: Fecha) => void;
}

const PESTANAS: { id: Pestana; nombre: string; Icono: any }[] = [
  { id: "hoy", nombre: "Hoy", Icono: LuHouse },
  { id: "calendario", nombre: "Calendario", Icono: LuCalendarDays },
  { id: "analisis", nombre: "Análisis", Icono: LuChartColumn },
  { id: "ajustes", nombre: "Ajustes", Icono: LuSlidersHorizontal },
];

export function App() {
  const [con, setCon] = useState<Conexion | null>(null);
  const [error, setError] = useState(false);
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_BASE);
  const [crudos, setCrudos] = useState<Ciclo[] | null>(null);
  const [registros, setRegistros] = useState<Record<Fecha, Registro>>({});
  const [pestana, setPestana] = useState<Pestana>(() => (location.hash.slice(1) as Pestana) || "hoy");
  const [dia, setDia] = useState<Fecha | null>(null);
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const { toast, aviso } = useToast();

  useEffect(() => {
    let quitar = () => {};
    conectar().then(c => {
      setCon(c);
      quitar = c.escuchar({
        ajustes: a => setAjustes({ ...AJUSTES_BASE, ...(a ?? {}) }),
        ciclos: setCrudos,
        registros: setRegistros,
        error: () => setError(true),
      });
    }).catch(() => setError(true));
    const on = () => setEnLinea(true), off = () => setEnLinea(false);
    addEventListener("online", on); addEventListener("offline", off);
    return () => { quitar(); removeEventListener("online", on); removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    history.replaceState(null, "", pestana === "hoy" ? location.pathname : "#" + pestana);
    document.querySelector(".contenido")?.scrollTo({ top: 0 });
  }, [pestana]);

  const ciclos = useMemo(() => ordenar(crudos ?? []), [crudos]);
  const abrirDia = useCallback((f: Fecha) => setDia(f), []);

  if (error && !con) return <Pantalla titulo="No pude conectar" texto="Revisa tu internet y vuelve a abrir LuNad." boton="Reintentar" accion={() => location.reload()} />;
  if (!con || crudos === null) return <Cargando />;

  const datos: Datos = { con, ajustes, ciclos, registros, aviso, abrirDia };

  if (!ciclos.length) return <><Bienvenida datos={datos} /><Toast toast={toast} /></>;

  return (
    <div className="app">
      {!enLinea && <div className="sin-red"><LuWifiOff /> Sin internet: lo que guardes se sube al volver la conexión</div>}
      <main className="contenido">
        {pestana === "hoy" && <Hoy datos={datos} ir={setPestana} />}
        {pestana === "calendario" && <Calendario datos={datos} />}
        {pestana === "analisis" && <Analisis datos={datos} />}
        {pestana === "ajustes" && <AjustesVista datos={datos} />}
      </main>
      <nav className="menu-inferior" aria-label="Secciones">
        {PESTANAS.map(({ id, nombre, Icono }) => (
          <button key={id} type="button" className={pestana === id ? "activa" : ""} aria-current={pestana === id ? "page" : undefined} onClick={() => setPestana(id)}>
            <span className="icono"><Icono /></span>
            <span>{nombre}</span>
          </button>
        ))}
      </nav>
      {dia && <HojaRegistro datos={datos} fecha={dia} cerrar={() => setDia(null)} />}
      <Toast toast={toast} />
    </div>
  );
}

/** Estado de hoy, listo para cualquier vista */
export function useEstado(datos: Datos, fecha: Fecha = hoy()) {
  const st = useMemo(() => estadisticas(datos.ciclos, datos.ajustes), [datos.ciclos, datos.ajustes]);
  const est = useMemo(() => estadoDe(fecha, datos.ciclos, st), [fecha, datos.ciclos, st]);
  return { st, est };
}

function Cargando() {
  return (
    <div className="cargando" aria-busy="true" aria-label="Cargando LuNad">
      <div className="logo-luna"><svg viewBox="0 0 24 24"><path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z" fill="currentColor" /></svg></div>
      <div className="esqueleto anillo-esq" />
      <div className="esqueleto linea" /><div className="esqueleto linea corta" />
    </div>
  );
}

function Pantalla({ titulo, texto, boton, accion }: { titulo: string; texto: string; boton: string; accion: () => void }) {
  return (
    <div className="pantalla-centro">
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <button className="btn primario" type="button" onClick={accion}>{boton}</button>
    </div>
  );
}
