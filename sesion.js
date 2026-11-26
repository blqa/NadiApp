/* =========================================================
   Sesión única de NadiApp
   Una sola puerta para todo el sitio: “¿Eres Nadia o Luis?”
   y luego la contraseña de esa persona.

   Las cuentas son fijas (se crean una sola vez en Firebase →
   Authentication → Users). Nadie más puede registrarse.

   Úsalo en cualquier página, lo más arriba posible del <head>:
     <script src="sesion.js"></script>        (páginas de la raíz)
     <script src="../sesion.js"></script>     (páginas dentro de carpetas)

   Lo que deja listo para las páginas:
     Sesion.nombre     → "Nadia" o "Luis"
     Sesion.esAdmin    → true si es Luis
     Sesion.listo      → promesa que se cumple cuando ya entró
     Sesion.salir()    → cierra la sesión en todo el sitio
     Sesion.mostrar()  → vuelve a mostrar la puerta
   ========================================================= */
(function () {
  "use strict";

  const CONFIG = {
    apiKey: "AIzaSyBqXPV9LA3j1MY6swbM-d4YqsuxGT37Q7g",
    authDomain: "nadiapp-b44ae.firebaseapp.com",
    projectId: "nadiapp-b44ae",
    storageBucket: "nadiapp-b44ae.firebasestorage.app",
    messagingSenderId: "458286198231",
    appId: "1:458286198231:web:d9801e0dd6ea4fd0ae2f92",
  };

  // Las dos cuentas. Son correos “de mentira”: solo sirven como usuario.
  const CUENTAS = {
    Nadia: { correo: "nadia@godsplan.site", color: "#e11d48", inicial: "N" },
    Luis:  { correo: "luis@godsplan.site",  color: "#7c3aed", inicial: "L" },
  };
  const ADMIN = "Luis";
  // Cuentas restringidas: no pueden entrar (ni escribir contraseña).
  // Para quitar la restricción, deja la lista vacía:  const RESTRINGIDAS = [];
  const RESTRINGIDAS = [];
  const restringida = n => RESTRINGIDAS.includes(n);
  const LLAVE = "nadiapp-sesion"; // guarda solo el nombre, para no hacer esperar
  const SDK = "https://www.gstatic.com/firebasejs/11.6.1/";

  const leerPista = () => { try { return localStorage.getItem(LLAVE); } catch (e) { return null; } };
  const guardarPista = n => { try { n ? localStorage.setItem(LLAVE, n) : localStorage.removeItem(LLAVE); } catch (e) {} };

  function nombreDe(correo) {
    correo = String(correo || "").toLowerCase();
    return Object.keys(CUENTAS).find(n => CUENTAS[n].correo === correo) || null;
  }

  let pista = leerPista();
  if (pista && (!CUENTAS[pista] || restringida(pista))) pista = null;
  let expulsada = null;

  /* ---------- Estilos de la puerta ---------- */
  const css = `
  html.ses-cerrado body > *:not(#ses-puerta) { visibility: hidden !important; }
  html.ses-cerrado, html.ses-cerrado body { overflow: hidden !important; }
  #ses-puerta {
    position: fixed; inset: 0; z-index: 2147483000;
    display: grid; place-items: center; padding: 24px;
    font-family: "Quicksand", "Figtree", system-ui, -apple-system, sans-serif;
    color: #3b2433;
    background:
      radial-gradient(900px 520px at 0% -10%, #ffe4e6 0%, transparent 60%),
      radial-gradient(800px 520px at 100% 10%, #f3e8ff 0%, transparent 55%),
      radial-gradient(700px 500px at 50% 110%, #fde68a55 0%, transparent 60%),
      #fff7f8;
    opacity: 1; transition: opacity .35s ease;
    -webkit-tap-highlight-color: transparent;
  }
  #ses-puerta.ses-fuera { opacity: 0; pointer-events: none; }
  #ses-puerta * { box-sizing: border-box; }
  .ses-caja { width: 100%; max-width: 380px; text-align: center; animation: ses-sube .5s cubic-bezier(.2,.8,.2,1); }
  @keyframes ses-sube { from { opacity: 0; transform: translateY(14px); } }
  .ses-logo { width: 56px; height: 56px; margin: 0 auto 18px; border-radius: 18px; display: grid; place-items: center;
    background: linear-gradient(135deg, #fb7185, #d946ef); color: #fff; box-shadow: 0 12px 28px -10px #e11d4888; }
  .ses-logo svg { width: 26px; height: 26px; }
  .ses-caja h1 { margin: 0; font-size: 30px; line-height: 1.1; font-weight: 800; letter-spacing: -.02em; }
  .ses-caja h1 em { font-family: "Playfair Display", "Fraunces", Georgia, serif; font-weight: 700;
    background: linear-gradient(120deg, #e11d48, #c026d3 60%, #7c3aed); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .ses-sub { margin: 10px 0 28px; color: #8a6b7d; font-size: 15px; font-weight: 600; }
  .ses-quien { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ses-persona { appearance: none; border: 1px solid #fff; cursor: pointer; padding: 22px 10px 18px; border-radius: 26px;
    background: rgba(255,255,255,.8); box-shadow: 0 14px 34px -16px #e11d4855; font: inherit; color: inherit;
    transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s; }
  .ses-persona:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -16px #e11d4877; }
  .ses-persona:active { transform: scale(.97); }
  .ses-persona:focus-visible, .ses-boton:focus-visible, .ses-campo:focus-visible, .ses-atras:focus-visible { outline: 3px solid #fb7185; outline-offset: 3px; }
  .ses-avatar { width: 64px; height: 64px; margin: 0 auto 12px; border-radius: 50%; display: grid; place-items: center;
    color: #fff; font-size: 26px; font-weight: 800; font-family: "Playfair Display", Georgia, serif; font-style: italic; }
  .ses-persona strong { display: block; font-size: 18px; font-weight: 800; }
  .ses-form { display: grid; gap: 12px; text-align: left; }
  .ses-form .ses-avatar { width: 76px; height: 76px; font-size: 32px; margin-bottom: 6px; }
  .ses-campo { width: 100%; padding: 14px 16px; border-radius: 16px; border: 2px solid #fde2e8; background: #fff;
    font: inherit; font-size: 16px; font-weight: 600; color: inherit; outline: none; transition: border-color .2s; }
  .ses-campo:focus { border-color: #fb7185; }
  .ses-boton { appearance: none; border: 0; cursor: pointer; padding: 14px; border-radius: 16px; font: inherit; font-size: 16px; font-weight: 800;
    color: #fff; background: linear-gradient(90deg, #fb7185, #e11d48); box-shadow: 0 12px 26px -12px #e11d48aa; }
  .ses-boton:disabled { opacity: .6; cursor: default; }
  .ses-error { min-height: 20px; margin: 0; color: #e11d48; font-size: 14px; font-weight: 700; text-align: center; }
  .ses-error.ses-tiembla { animation: ses-tiembla .35s; }
  @keyframes ses-tiembla { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .ses-atras { appearance: none; background: none; border: 0; cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; color: #8a6b7d; padding: 6px; justify-self: center; }
  .ses-cargando { color: #8a6b7d; font-weight: 700; }
  .ses-cargando i { display: inline-block; width: 8px; height: 8px; margin: 0 3px; border-radius: 50%; background: #fb7185; animation: ses-punto 1s infinite; }
  .ses-cargando i:nth-child(2) { animation-delay: .15s; } .ses-cargando i:nth-child(3) { animation-delay: .3s; }
  @keyframes ses-punto { 50% { opacity: .2; transform: translateY(-3px); } }
  @media (prefers-color-scheme: dark) {
    #ses-puerta { color: #f5e9f0; background:
      radial-gradient(900px 520px at 0% -10%, #4c1d3a 0%, transparent 60%),
      radial-gradient(800px 520px at 100% 10%, #2e1065 0%, transparent 55%), #170f1c; }
    .ses-persona { background: rgba(40,26,46,.85); border-color: #3a2843; }
    .ses-campo { background: #241a2d; border-color: #3a2843; }
    .ses-sub, .ses-atras, .ses-cargando { color: #c7aebd; }
  }
  @media (prefers-reduced-motion: reduce) { #ses-puerta *, #ses-puerta { animation: none !important; transition: none !important; } }
  `;
  const estilo = document.createElement("style");
  estilo.id = "ses-estilo";
  estilo.textContent = css;
  (document.head || document.documentElement).append(estilo);

  // Si no sabemos de nadie, la página se tapa desde el primer momento.
  if (!pista) document.documentElement.classList.add("ses-cerrado");

  /* ---------- Firebase (solo la parte de cuentas) ---------- */
  let promesa = null;
  function firebase() {
    if (promesa) return promesa;
    promesa = Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js")])
      .then(([app, A]) => {
        // La misma app de Firebase que usan las páginas: así comparten la sesión.
        const a = app.getApps().length ? app.getApp() : app.initializeApp(CONFIG);
        return { auth: A.getAuth(a), A };
      });
    promesa.catch(() => { promesa = null; });
    return promesa;
  }

  /* ---------- La puerta ---------- */
  let puerta = null;
  const enDom = fn => document.body ? fn() : document.addEventListener("DOMContentLoaded", fn, { once: true });
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const LUNA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a8.5 8.5 0 1 0 11 11Z"/></svg>';
  const avatar = n => `<span class="ses-avatar" style="background:linear-gradient(135deg,${CUENTAS[n].color}cc,${CUENTAS[n].color})">${CUENTAS[n].inicial}</span>`;

  function asegurarPuerta() {
    if (puerta) return puerta;
    puerta = document.createElement("div");
    puerta.id = "ses-puerta";
    puerta.setAttribute("role", "dialog");
    puerta.setAttribute("aria-modal", "true");
    puerta.setAttribute("aria-label", "Iniciar sesión en NadiApp");
    document.body.append(puerta);
    return puerta;
  }

  function pintar(html) {
    enDom(() => {
      const p = asegurarPuerta();
      p.classList.remove("ses-fuera");
      p.innerHTML = `<div class="ses-caja">${html}</div>`;
      document.documentElement.classList.add("ses-cerrado");
    });
  }

  function pintarCargando() {
    pintar(`<div class="ses-logo">${LUNA}</div><p class="ses-cargando">Abriendo <i></i><i></i><i></i></p>`);
  }

  function pintarQuien() {
    pintar(`<div class="ses-logo">${LUNA}</div>
      <h1>Hola, <em>¿quién eres?</em></h1>
      <p class="ses-sub">NadiApp es solo para nosotros dos.</p>
      <div class="ses-quien">
        ${Object.keys(CUENTAS).map(n => `<button class="ses-persona" type="button" data-quien="${n}">${avatar(n)}<strong>${n}</strong></button>`).join("")}
      </div>`);
    enDom(() => puerta.querySelectorAll("[data-quien]").forEach(b =>
      b.addEventListener("click", () => restringida(b.dataset.quien) ? pintarRestringida(b.dataset.quien) : pintarClave(b.dataset.quien))));
  }

  function pintarRestringida(nombre) {
    pintar(`<div class="ses-form">
        ${avatar(nombre)}
        <h1 style="text-align:center">Cuenta <em>restringida</em></h1>
        <p class="ses-sub" style="margin:4px 0 10px;text-align:center">La cuenta de ${esc(nombre)} está restringida por el momento, así que no se puede iniciar sesión.</p>
        <button class="ses-atras" type="button" id="ses-atras">← Volver</button>
      </div>`);
    enDom(() => puerta.querySelector("#ses-atras").addEventListener("click", pintarQuien));
  }

  function pintarClave(nombre, error = "") {
    if (restringida(nombre)) return pintarRestringida(nombre);
    pintar(`<form class="ses-form" id="ses-form" novalidate>
        ${avatar(nombre)}
        <h1 style="text-align:center">Hola, <em>${esc(nombre)}</em></h1>
        <p class="ses-sub" style="margin:0 0 6px;text-align:center">Escribe tu contraseña.</p>
        <input type="email" name="usuario" autocomplete="username" value="${esc(CUENTAS[nombre].correo)}" hidden>
        <input class="ses-campo" type="password" name="clave" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña" required>
        <p class="ses-error" id="ses-error" role="alert">${esc(error)}</p>
        <button class="ses-boton" type="submit">Entrar</button>
        <button class="ses-atras" type="button" id="ses-atras">← No soy ${esc(nombre)}</button>
      </form>`);
    enDom(() => {
      const form = puerta.querySelector("#ses-form");
      const campo = form.clave, err = form.querySelector("#ses-error"), boton = form.querySelector(".ses-boton");
      setTimeout(() => campo.focus(), 60);
      form.querySelector("#ses-atras").addEventListener("click", pintarQuien);
      form.addEventListener("submit", async e => {
        e.preventDefault();
        if (!campo.value) { mostrarError(err, "Escribe tu contraseña."); return; }
        boton.disabled = true; boton.textContent = "Entrando…";
        try {
          const { auth, A } = await firebase();
          await A.signInWithEmailAndPassword(auth, CUENTAS[nombre].correo, campo.value);
          guardarPista(nombre);
          // Recargamos para que todas las partes de la página vean la sesión.
          location.reload();
        } catch (ex) {
          boton.disabled = false; boton.textContent = "Entrar";
          campo.select();
          mostrarError(err, mensaje(ex));
        }
      });
    });
  }

  function mostrarError(el, texto) {
    el.textContent = texto;
    el.classList.remove("ses-tiembla"); void el.offsetWidth; el.classList.add("ses-tiembla");
  }

  function mensaje(e) {
    const c = (e && (e.code || e.message)) || "";
    if (/invalid-credential|wrong-password|invalid-login/.test(c)) return "Esa no es la contraseña.";
    if (/user-not-found/.test(c)) return "Esta cuenta todavía no existe en Firebase.";
    if (/too-many-requests/.test(c)) return "Muchos intentos. Espera un ratito.";
    if (/network|Failed to fetch|import/i.test(c)) return "Sin conexión. Revisa tu internet.";
    if (/user-disabled/.test(c)) return "Esta cuenta está desactivada.";
    return "Algo salió mal. Intenta otra vez.";
  }

  function quitarPuerta() {
    document.documentElement.classList.remove("ses-cerrado");
    if (!puerta) return;
    puerta.classList.add("ses-fuera");
    setTimeout(() => { if (puerta && puerta.classList.contains("ses-fuera")) { puerta.remove(); puerta = null; } }, 400);
  }

  /* ---------- Revisar quién está dentro ---------- */
  let cumplir;
  const listo = new Promise(ok => { cumplir = ok; });

  if (!pista) pintarQuien();

  firebase().then(({ auth, A }) => {
    A.onAuthStateChanged(auth, user => {
      const nombre = user && nombreDe(user.email);
      if (nombre && restringida(nombre)) {
        // Si ya tenía la sesión abierta, se cierra y se le avisa
        guardarPista(null);
        Sesion.nombre = null; Sesion.esAdmin = false;
        expulsada = nombre;
        A.signOut(auth);
        pintarRestringida(nombre);
        return;
      }
      if (nombre) {
        guardarPista(nombre);
        Sesion.nombre = nombre;
        Sesion.esAdmin = nombre === ADMIN;
        Sesion.uid = user.uid;
        Sesion.correo = user.email;
        document.documentElement.dataset.sesion = nombre.toLowerCase();
        quitarPuerta();
        cumplir({ nombre, esAdmin: Sesion.esAdmin, uid: user.uid, correo: user.email });
        return;
      }
      if (user && !nombre) { A.signOut(auth); return; } // una cuenta vieja que ya no se usa
      guardarPista(null);
      Sesion.nombre = null; Sesion.esAdmin = false;
      if (expulsada) { const n = expulsada; expulsada = null; return pintarRestringida(n); }
      pintarQuien();
    });
  }).catch(() => {
    if (!pista) pintar(`<div class="ses-logo">${LUNA}</div><h1>Sin conexión</h1>
      <p class="ses-sub">Revisa tu internet y vuelve a abrir la página.</p>
      <button class="ses-boton" type="button" onclick="location.reload()">Reintentar</button>`);
  });

  const Sesion = window.Sesion = {
    nombre: pista,
    esAdmin: pista === ADMIN,
    uid: null,
    correo: pista ? CUENTAS[pista].correo : null,
    cuentas: CUENTAS,
    nombreDe,
    listo,
    mostrar: pintarQuien,
    async salir() {
      guardarPista(null);
      try { const { auth, A } = await firebase(); await A.signOut(auth); } catch (e) {}
      try { localStorage.removeItem("nyl-nube"); } catch (e) {}
      location.reload();
    },
  };
  if (pista) document.documentElement.dataset.sesion = pista.toLowerCase();
})();
