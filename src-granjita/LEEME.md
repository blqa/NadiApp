# Granjita (TypeScript + React)

Juego de granja cooperativo en tiempo real para Nadia y Luis. Se publica en `nadiapp.site/granjita`
(`../granjita.html` + la carpeta compilada `../granjita-app/`).

## Cómo hacer cambios
1. Instala Bun (https://bun.sh) una sola vez y corre `bun install` aquí.
2. Edita lo que quieras en `src/`.
3. Compila: `bun run build` → actualiza `../granjita-app/`.
4. Sube los cambios a GitHub.

## Archivos
- `src/datos.ts` → **catálogo**: cultivos, tiempos, precios, recetas, decoraciones, gatito.
- `src/tipos.ts` → forma de los datos en Firestore.
- `src/firebase.ts` → tiempo real + todas las acciones (con transacciones, sin choques entre los dos).
- `src/tiempo.ts` → crecimiento de cultivos y hora de Ciudad de México (día/tarde/noche).
- `src/App.tsx` → estado del juego, herramienta "Mano" inteligente, presencia en vivo.
- `src/componentes/` → escena (cabaña, tablón, cofre, terreno, gatito), barra de herramientas, dibujos SVG.
- `src/modales/` → Tienda, Cabaña, Cofre, Herbario, Tablón y Gatito.

## Firestore
```
granjita/estado                         monedas, tamaño, inventario, herbario, recetas
granjita/estado/parcelas/{fila_col}     una casilla por documento
granjita/estado/cofre/{id}              regalos con notita (de, para, abiertoAt)
granjita/estado/encargos/{id}           tablón de pedidos
granjita/estado/jugadores/{nadia|luis}  presencia en vivo (casilla, última acción, vistoAt)
granjita/mascota                        el gatito (cariño, caricias y comidas por día)
```
Las reglas están en `../firestore.rules` (sección Granjita).
