/* Opciones del registro diario y textos de cada fase.
   Los "id" son los mismos que usaba la LuNad anterior,
   para que los registros viejos se sigan viendo. */
import type { Fase, Objetivo } from "./ciclo";

export const ANIMOS = [
  { id: "feliz", emoji: "😊", nombre: "Feliz" },
  { id: "tranquila", emoji: "😌", nombre: "Tranquila" },
  { id: "cariñosa", emoji: "🥰", nombre: "Cariñosa" },
  { id: "sensible", emoji: "🥺", nombre: "Sensible" },
  { id: "triste", emoji: "😔", nombre: "Triste" },
  { id: "ansiosa", emoji: "😰", nombre: "Ansiosa" },
  { id: "enojada", emoji: "😠", nombre: "Enojada" },
  { id: "cansada", emoji: "😴", nombre: "Cansada" },
];

export const SINTOMAS = [
  { id: "Cólicos", nombre: "Cólicos" },
  { id: "Dolor de cabeza", nombre: "Dolor de cabeza" },
  { id: "Hinchazón", nombre: "Hinchazón" },
  { id: "Senos sensibles", nombre: "Senos sensibles" },
  { id: "Dolor de espalda", nombre: "Dolor de espalda" },
  { id: "Acné", nombre: "Acné" },
  { id: "Fatiga", nombre: "Fatiga" },
  { id: "Antojos", nombre: "Antojos" },
  { id: "Náuseas", nombre: "Náuseas" },
  { id: "Insomnio", nombre: "Insomnio" },
  { id: "Mucha energía", nombre: "Mucha energía" },
];

export const FLUJOS = ["Manchado", "Ligero", "Medio", "Abundante"];
export const CERVICAL = [
  { id: "Seco", nota: "Poco o nada" },
  { id: "Pegajoso", nota: "Espeso" },
  { id: "Cremoso", nota: "Como loción" },
  { id: "Clara de huevo", nota: "Elástico, transparente" },
];
export const PROTECCION = ["Condón", "Pastilla/DIU", "Ninguna"];

export const OBJETIVOS: { id: Objetivo; nombre: string; nota: string }[] = [
  { id: "track", nombre: "Conocer mi ciclo", nota: "Seguir mi periodo y cómo me siento" },
  { id: "avoid", nombre: "Evitar embarazo", nota: "Ver con claridad los días fértiles" },
  { id: "conceive", nombre: "Buscar embarazo", nota: "Saber cuándo hay más probabilidad" },
];

export const FASES: Record<Fase, { nombre: string; corto: string; color: string }> = {
  menstrual: { nombre: "Periodo", corto: "Menstrual", color: "var(--periodo)" },
  folicular: { nombre: "Fase folicular", corto: "Folicular", color: "var(--folicular)" },
  fertil: { nombre: "Días fértiles", corto: "Fértil", color: "var(--fertil)" },
  ovulacion: { nombre: "Ovulación", corto: "Ovulación", color: "var(--ovulacion)" },
  lutea: { nombre: "Fase lútea", corto: "Lútea", color: "var(--lutea)" },
  retraso: { nombre: "Periodo retrasado", corto: "Retraso", color: "var(--retraso)" },
};

export function consejo(fase: Fase, objetivo: Objetivo, diasRetraso = 0): { titulo: string; texto: string } {
  switch (fase) {
    case "menstrual":
      return { titulo: "Tu cuerpo se está renovando", texto: "Calor en el vientre, agua y un buen descanso suelen ayudar con los cólicos. Está bien ir más lento estos días." };
    case "folicular":
      return { titulo: "La energía va en aumento", texto: "Muchas personas se sienten con más ánimo y concentración en esta fase. Buen momento para moverte y empezar cosas nuevas." };
    case "fertil":
      if (objetivo === "avoid") return { titulo: "Días con probabilidad de embarazo", texto: "Si no buscas embarazo, usa protección estos días. Recuerda que las predicciones son aproximadas y no sustituyen un método anticonceptivo." };
      if (objetivo === "conceive") return { titulo: "Tu ventana fértil está abierta", texto: "Estos son los días con más probabilidad de embarazo, sobre todo los 2 días antes de la ovulación." };
      return { titulo: "Estás en tu ventana fértil", texto: "Es posible que notes más flujo transparente y elástico, como clara de huevo. Es una señal normal de esta fase." };
    case "ovulacion":
      if (objetivo === "avoid") return { titulo: "Día de ovulación estimado", texto: "Es el día con más probabilidad de embarazo. Las predicciones no sustituyen un método anticonceptivo." };
      if (objetivo === "conceive") return { titulo: "Hoy es tu día más fértil estimado", texto: "La ovulación es aproximada: los días de alrededor también cuentan mucho." };
      return { titulo: "Día de ovulación estimado", texto: "Algunas personas sienten una pequeña molestia de un lado del vientre. Es normal." };
    case "lutea":
      return { titulo: "Fase lútea", texto: "Si notas antojos, hinchazón o cambios de humor, es común en esta fase. Dormir bien y comer rico y nutritivo ayuda mucho." };
    case "retraso":
      return { titulo: `Tu periodo lleva ${diasRetraso} ${diasRetraso === 1 ? "día" : "días"} de retraso`, texto: objetivo === "conceive" ? "Si buscas embarazo, una prueba puede darte la respuesta. ¡Mucha suerte!" : "El estrés, los viajes o cambios de rutina pueden moverlo. Si te preocupa, una prueba de embarazo o tu médico pueden darte certeza." };
  }
}
