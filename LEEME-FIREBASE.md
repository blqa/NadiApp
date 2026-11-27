# Firebase de NadiApp (proyecto `nadiapp-b44ae`)

Todo NadiApp usa **una sola sesión**: al abrir cualquier página aparece
“¿Quién eres?”, eliges **Nadia** o **Luis** y escribes tu contraseña.
Luis es el admin (por ejemplo, puede leer los libros de la Biblioteca
que todavía no se abren).

La configuración de Firebase en el código es pública a propósito.
Lo que protege los datos son **las reglas** (`firestore.rules`).

## Lo que hay que hacer una sola vez (https://console.firebase.google.com)

1. Entra al proyecto **nadiapp-b44ae**.
2. **Authentication → Sign-in method**: que esté activado **Correo electrónico/Contraseña**.
3. **Authentication → Users**: tienen que existir estas dos cuentas:
   - `nadia@godsplan.site`
   - `luis@godsplan.site`

   Si alguna no existe, dale **Add user**, escribe el correo y su contraseña.
   (Son correos de mentira: solo sirven como usuario, nunca llega nada ahí.)
4. **Firestore Database → Reglas**: borra todo, pega completo el archivo
   `firestore.rules` y dale **Publicar**.
5. Listo. Ya no se pueden crear cuentas nuevas desde la página.

## Si no te acuerdas de una contraseña

Firebase no deja cambiarla desde la consola para estos correos de mentira.
Opciones: borrar el usuario y crearlo otra vez con la misma dirección
(ojo: lo guardado “de esa persona” en LuNad y Películas queda con la cuenta
vieja), o pedirle a Claude que haga una página temporal para cambiarla
estando dentro de la sesión.

## Qué página usa qué

| Página | Qué guarda en Firestore |
|---|---|
| LuNad | `artifacts/…/users/{uid}/…` (ciclos, registros, ajustes) |
| Mis Películas | `artifacts/…/users/{uid}/ratings` y `artifacts/…/public/data/community_ratings` |
| FinaNad | `artifacts/…/public/data/` (cuentas, metas, movimientos, compartidos) |
| Nadia y Luis | `buzon`, `pienso`, `respuestas`, `compartido/suenos`, `compartido/dedicadas` |
| Granjita | `granjita/estado` (+ `parcelas`, `cofre`, `encargos`, `jugadores`) y `granjita/mascota` |
| Menú, Escritos, Cumple 28 | Nada (solo piden la sesión) |
| Invitación (`invite.html`) | Nada y **no pide sesión** (es para invitados) |
