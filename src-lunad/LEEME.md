# LuNad 2.0 (TypeScript + React)

El código fuente de LuNad está aquí. Lo que se publica en la página es la carpeta `../lunad-app/`
(ya compilada) y `../lunad.html`.

## Cómo hacer cambios
1. Instala Bun (https://bun.sh) una sola vez.
2. Dentro de esta carpeta: `bun install` (solo la primera vez).
3. Edita lo que quieras en `src/`.
4. Compila: `bun run build` → actualiza `../lunad-app/app.js` y `app.css`.
5. Sube los cambios a GitHub.

## Archivos
- `src/ciclo.ts` → cálculos del ciclo (fases, predicciones, promedios). Sin diseño.
- `src/firebase.ts` → guardar/leer en Firebase (mismas rutas que la LuNad anterior).
- `src/opciones.ts` → ánimos, síntomas, textos de cada fase.
- `src/vistas/` → pantallas: Hoy, Calendario, Análisis, Ajustes, Bienvenida.
- `src/componentes/` → anillo del ciclo, hoja de registro, avisos.
- `src/estilos.css` → todo el diseño (modo claro y oscuro).
