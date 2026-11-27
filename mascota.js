/* =========================================================
   HIJITO QUE PASEA
   Un hijito chiquito camina por la parte de abajo de la
   pantalla mientras navegas por NadiApp.
   - Si no lo alimentan en un rato, pide comida.
   - Si lo dejas solo (sin mover nada) mucho rato, se duerme.
   - Al tocarlo se abre un menú para darle de comer o apapacharlo.
   Los hijitos se guardan en Firebase (colección "hijitos"),
   así que Nadia y Luis cuidan a los mismos.

   Úsalo así (después de sesion.js):
     <script src="mascota.js" defer></script>
     <script src="mascota.js" defer data-alto="90"></script>   ← más arriba (si hay menú abajo)
     <script src="mascota.js" defer data-sin-paseo></script>   ← solo el dibujo (página de hijitos)
   ========================================================= */
(function () {
  "use strict";
  if (window.Hijito) return;
  const script = document.currentScript;

  /* ---------- Colores ---------- */
  const COLORES = {
    lila:    { nombre: "Lila",    c: "#b79cf2", panza: "#e4d8fd", oscuro: "#8b6fd6" },
    rosa:    { nombre: "Rosa",    c: "#f5a3c4", panza: "#fdd9e7", oscuro: "#dc6f9a" },
    menta:   { nombre: "Menta",   c: "#8fdcc2", panza: "#d2f4e8", oscuro: "#56b994" },
    cielo:   { nombre: "Cielo",   c: "#90c6f5", panza: "#d6eafd", oscuro: "#5a9be0" },
    durazno: { nombre: "Durazno", c: "#ffb98f", panza: "#ffe3d1", oscuro: "#ec8a5a" },
    limon:   { nombre: "Limón",   c: "#f0d96a", panza: "#fbf0bb", oscuro: "#cdb033" },
  };

  /* ---------- El dibujo (original: "Lunito") ----------
     Redondito, con orejitas largas que brillan en la punta,
     panza con estrellita y cachetes rosados. */
  let n = 0;
  function dibujo(color) {
    const k = COLORES[color] || COLORES.lila;
    const id = "hj" + (++n);
    return `<svg class="hj-svg" viewBox="0 0 64 66" aria-hidden="true">
      <defs><radialGradient id="${id}b" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <ellipse class="hj-sombra" cx="32" cy="63" rx="15" ry="2.6" fill="#2b1d2c" opacity=".16"/>
      <g class="hj-cuerpo-todo">
        <g class="hj-pie hj-pie-i"><ellipse cx="23.5" cy="59" rx="6" ry="3.8" fill="${k.oscuro}"/></g>
        <g class="hj-pie hj-pie-d"><ellipse cx="40.5" cy="59" rx="6" ry="3.8" fill="${k.oscuro}"/></g>
        <g class="hj-oreja hj-oreja-i"><ellipse cx="21" cy="15" rx="5.8" ry="12" transform="rotate(-20 21 15)" fill="${k.c}"/><ellipse cx="21" cy="16" rx="3" ry="8" transform="rotate(-20 21 16)" fill="${k.panza}"/><circle class="hj-luz" cx="17.2" cy="4.4" r="2.6" fill="#fff3a6"/></g>
        <g class="hj-oreja hj-oreja-d"><ellipse cx="43" cy="15" rx="5.8" ry="12" transform="rotate(20 43 15)" fill="${k.c}"/><ellipse cx="43" cy="16" rx="3" ry="8" transform="rotate(20 43 16)" fill="${k.panza}"/><circle class="hj-luz" cx="46.8" cy="4.4" r="2.6" fill="#fff3a6"/></g>
        <g class="hj-brazo hj-brazo-i"><ellipse cx="10" cy="42" rx="4" ry="6.5" transform="rotate(25 10 42)" fill="${k.oscuro}"/></g>
        <g class="hj-brazo hj-brazo-d"><ellipse cx="54" cy="42" rx="4" ry="6.5" transform="rotate(-25 54 42)" fill="${k.oscuro}"/></g>
        <path d="M32 16 C49 16 56 28 56 39 C56 52 46 60 32 60 C18 60 8 52 8 39 C8 28 15 16 32 16Z" fill="${k.c}"/>
        <path d="M32 16 C49 16 56 28 56 39 C56 52 46 60 32 60 C18 60 8 52 8 39 C8 28 15 16 32 16Z" fill="url(#${id}b)"/>
        <ellipse cx="32" cy="48" rx="13" ry="9.5" fill="${k.panza}"/>
        <path d="M32 44.2 L33.1 46.8 L35.9 47 L33.8 48.8 L34.4 51.5 L32 50.1 L29.6 51.5 L30.2 48.8 L28.1 47 L30.9 46.8Z" fill="#fff" opacity=".85"/>
        <ellipse class="hj-cachete" cx="17" cy="40" rx="3.6" ry="2.3" fill="#ff7aa0" opacity=".45"/>
        <ellipse class="hj-cachete" cx="47" cy="40" rx="3.6" ry="2.3" fill="#ff7aa0" opacity=".45"/>
        <g class="hj-ojos">
          <ellipse cx="24" cy="33" rx="5" ry="6" fill="#fff"/><ellipse cx="40" cy="33" rx="5" ry="6" fill="#fff"/>
          <g class="hj-pupilas"><circle cx="24.8" cy="34" r="3.3" fill="#2b1d2c"/><circle cx="40.8" cy="34" r="3.3" fill="#2b1d2c"/>
          <circle cx="26" cy="32.4" r="1.2" fill="#fff"/><circle cx="42" cy="32.4" r="1.2" fill="#fff"/></g>
        </g>
        <g class="hj-ojos-felices" fill="none" stroke="#2b1d2c" stroke-width="2.2" stroke-linecap="round"><path d="M19.5 34 Q24 29 28.5 34"/><path d="M35.5 34 Q40 29 44.5 34"/></g>
        <g class="hj-ojos-dormidos" fill="none" stroke="#2b1d2c" stroke-width="2" stroke-linecap="round"><path d="M19.5 33 Q24 36.5 28.5 33"/><path d="M35.5 33 Q40 36.5 44.5 33"/></g>
        <path class="hj-boca" d="M29 40.5 Q32 43.5 35 40.5" fill="none" stroke="#2b1d2c" stroke-width="1.8" stroke-linecap="round"/>
        <g class="hj-boca-abierta"><ellipse cx="32" cy="41.8" rx="3.2" ry="2.8" fill="#6b2a3a"/><ellipse cx="32" cy="43.2" rx="2" ry="1.2" fill="#ff8fab"/></g>
        <path class="hj-boca-triste" d="M29 42.5 Q32 40 35 42.5" fill="none" stroke="#2b1d2c" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  /* ---------- Estilos ---------- */
  const css = `
  .hj { position: relative; width: 100%; height: 100%; }
  .hj-svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .hj .hj-ojos-felices, .hj .hj-ojos-dormidos, .hj .hj-boca-abierta, .hj .hj-boca-triste { display: none; }
  .hj .hj-ojos { transform-origin: 32px 33px; animation: hj-parpadeo 4.2s infinite; }
  @keyframes hj-parpadeo { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
  .hj .hj-cuerpo-todo { transform-origin: 32px 60px; animation: hj-respira 3s ease-in-out infinite; }
  @keyframes hj-respira { 50% { transform: scale(1.025, .975); } }
  .hj .hj-oreja-i { transform-origin: 24px 24px; animation: hj-oreja 3.6s ease-in-out infinite; }
  .hj .hj-oreja-d { transform-origin: 40px 24px; animation: hj-oreja 3.6s ease-in-out infinite reverse; }
  @keyframes hj-oreja { 50% { transform: rotate(-6deg); } }
  .hj .hj-luz { animation: hj-luz 2.4s ease-in-out infinite; }
  @keyframes hj-luz { 50% { opacity: .45; } }
  .hj.hj-camina .hj-cuerpo-todo { animation: hj-rebota .42s ease-in-out infinite; }
  @keyframes hj-rebota { 50% { transform: translateY(-2.5px); } }
  .hj.hj-camina .hj-pie-i { animation: hj-pie .42s ease-in-out infinite; }
  .hj.hj-camina .hj-pie-d { animation: hj-pie .42s ease-in-out infinite reverse; }
  @keyframes hj-pie { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  .hj.hj-feliz .hj-ojos, .hj.hj-come .hj-ojos { display: none; }
  .hj.hj-feliz .hj-ojos-felices, .hj.hj-come .hj-ojos-felices { display: inline; }
  .hj.hj-feliz .hj-boca, .hj.hj-come .hj-boca, .hj.hj-hambre .hj-boca { display: none; }
  .hj.hj-feliz .hj-boca-abierta { display: inline; }
  .hj.hj-feliz .hj-cuerpo-todo { animation: hj-salta .5s cubic-bezier(.3,.7,.3,1) 2; }
  @keyframes hj-salta { 40% { transform: translateY(-9px) scale(.96, 1.05); } }
  .hj.hj-feliz .hj-brazo-d { transform-origin: 52px 46px; animation: hj-saluda .3s ease-in-out infinite alternate; }
  @keyframes hj-saluda { to { transform: rotate(-35deg); } }
  .hj.hj-come .hj-boca-abierta { display: inline; transform-origin: 32px 42px; animation: hj-mastica .28s ease-in-out infinite alternate; }
  @keyframes hj-mastica { to { transform: scaleY(.35); } }
  .hj.hj-hambre .hj-boca-triste { display: inline; }
  .hj.hj-hambre .hj-pupilas { transform: translateY(1.2px); }
  .hj.hj-duerme .hj-ojos, .hj.hj-duerme .hj-boca { display: none; }
  .hj.hj-duerme .hj-ojos-dormidos { display: inline; }
  .hj.hj-duerme .hj-cuerpo-todo { animation: hj-respira-lento 3.4s ease-in-out infinite; }
  @keyframes hj-respira-lento { 50% { transform: scale(1.05, .95) translateY(1px); } }
  .hj.hj-duerme .hj-oreja { animation: none; }
  .hj.hj-duerme .hj-oreja-i { transform: rotate(-24deg); } .hj.hj-duerme .hj-oreja-d { transform: rotate(24deg); }
  .hj.hj-duerme .hj-luz { opacity: .25; animation: none; }
  .hj-zzz { position: absolute; right: -6%; top: -18%; font: 700 12px/1 system-ui, sans-serif; color: #8b6fd6; pointer-events: none; }
  .hj-zzz i { position: absolute; font-style: normal; animation: hj-z 2.4s ease-out infinite; opacity: 0; }
  .hj-zzz i:nth-child(2) { animation-delay: .8s; font-size: 14px; } .hj-zzz i:nth-child(3) { animation-delay: 1.6s; font-size: 16px; }
  @keyframes hj-z { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(12px, -22px); } }
  .hj-corazones { position: absolute; left: 50%; top: -10%; pointer-events: none; }
  .hj-corazones i { position: absolute; font-style: normal; color: #ff6f9a; font-size: 14px; animation: hj-corazon 1.3s ease-out forwards; }
  @keyframes hj-corazon { from { opacity: 1; transform: translate(0, 0) scale(.6); } to { opacity: 0; transform: translate(var(--x, 0), -34px) scale(1.2); } }
  @media (prefers-reduced-motion: reduce) { .hj *, .hj { animation: none !important; } }

  /* ---- paseo ---- */
  #hijito-paseo { position: fixed; left: 0; bottom: calc(var(--hj-alto, 0px) + env(safe-area-inset-bottom) + 2px); width: 52px; height: 54px; z-index: 2147482000;
    transform: translateX(var(--hj-x, 20px)); pointer-events: none; transition: opacity .4s; }
  #hijito-paseo.oculto { opacity: 0; }
  #hijito-paseo .hj-boton { all: unset; display: block; width: 100%; height: 100%; cursor: pointer; pointer-events: auto; -webkit-tap-highlight-color: transparent; }
  #hijito-paseo .hj-boton:focus-visible { outline: 3px solid #b79cf2; outline-offset: 2px; border-radius: 12px; }
  #hijito-paseo .hj-giro { width: 100%; height: 100%; transform: scaleX(var(--hj-dir, 1)); transition: transform .25s; }
  .hj-globo { position: fixed; z-index: 2147482001; max-width: 13rem; padding: .45rem .7rem; border-radius: 14px 14px 14px 4px; background: #fff; color: #3b2a3a;
    font: 600 13px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif; box-shadow: 0 10px 24px -10px #2b1d2c66; pointer-events: none;
    animation: hj-globo .25s cubic-bezier(.2,.8,.2,1); white-space: nowrap; }
  @keyframes hj-globo { from { opacity: 0; transform: translateY(6px) scale(.9); } }
  .hj-menu { position: fixed; z-index: 2147482002; width: min(16.5rem, calc(100vw - 1.5rem)); padding: .9rem; border-radius: 20px; background: #fffafc; color: #3b2a3a;
    font: 500 14px/1.35 system-ui, -apple-system, "Segoe UI", sans-serif; box-shadow: 0 20px 44px -16px #2b1d2c80; border: 1px solid #f1e2ea; animation: hj-globo .22s ease; }
  .hj-menu h4 { margin: 0 0 .1rem; font: 700 16px/1.2 system-ui, sans-serif; }
  .hj-menu p { margin: 0 0 .6rem; font-size: 12px; color: #7a6879; }
  .hj-barra { height: 7px; border-radius: 9px; background: #f3e8ee; overflow: hidden; margin: .25rem 0 .7rem; }
  .hj-barra i { display: block; height: 100%; border-radius: 9px; background: linear-gradient(90deg, #ffb36b, #ff7aa0); }
  .hj-comidas { display: grid; grid-template-columns: repeat(3, 1fr); gap: .35rem; margin-bottom: .45rem; }
  .hj-menu button { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: .3rem; padding: .55rem .4rem; border-radius: 12px; background: #f6eef3; cursor: pointer; font-weight: 700; font-size: 13px; text-align: center; }
  .hj-menu button:hover { background: #efe2ea; }
  .hj-menu button:focus-visible { outline: 2px solid #b79cf2; }
  .hj-comidas button { flex-direction: column; gap: 0; font-size: 11px; } .hj-comidas button span { font-size: 22px; line-height: 1.2; }
  .hj-menu .hj-fila { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; }
  .hj-menu a { display: block; margin-top: .55rem; text-align: center; font-weight: 700; font-size: 13px; color: #8b6fd6; text-decoration: none; }
  .hj-menu .hj-esconder { background: none; color: #a898a8; font-weight: 600; font-size: 12px; width: 100%; margin-top: .2rem; padding: .35rem; }
  .hj-comida-vuela { position: fixed; z-index: 2147482003; font-size: 22px; pointer-events: none; animation: hj-vuela .55s ease-in forwards; }
  @keyframes hj-vuela { to { transform: translate(var(--dx), var(--dy)) scale(.4); opacity: .2; } }
  `;
  const st = document.createElement("style");
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---------- Firebase (los hijitos son de los dos) ---------- */
  const SDK = "https://www.gstatic.com/firebasejs/11.6.1/";
  let fb = null;
  function firebase() {
    if (fb) return fb;
    fb = (async () => {
      if (window.Sesion) await window.Sesion.listo;
      const [appMod, F] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-firestore.js")]);
      const app = appMod.getApps().length ? appMod.getApp() : null;
      if (!app) throw new Error("sin app");
      let db;
      try { db = F.getFirestore(app); } catch (e) { db = F.initializeFirestore(app, {}); }
      return { db, F };
    })();
    fb.catch(() => { fb = null; });
    return fb;
  }

  const HAMBRE_H = 4;           // a las 4 horas sin comer pide comida
  const SUENO_MS = 75 * 1000;   // a los 75 s sin que muevas nada se duerme
  const COMIDAS = [["🍓", "Fresa"], ["🍪", "Galleta"], ["🍙", "Onigiri"]];

  function pancita(comidaAt, ahora = Date.now()) {
    if (!comidaAt) return 0.3;
    return Math.max(0, 1 - (ahora - comidaAt) / (HAMBRE_H * 2 * 3600e3));
  }

  window.Hijito = { COLORES, dibujo, firebase, pancita, HAMBRE_H, COMIDAS };

  if (script && script.hasAttribute("data-sin-paseo")) return;
  if (matchMedia("print").matches) return;

  /* =========================================================
     EL PASEO
     ========================================================= */
  const LLAVE = "nadiapp-hijito";            // copia local del acompañante
  const LLAVE_OCULTO = "nadiapp-hijito-oculto";
  const hoyStr = () => new Date().toISOString().slice(0, 10);
  const leer = () => { try { return JSON.parse(localStorage.getItem(LLAVE) || "null"); } catch (e) { return null; } };
  const guardar = h => { try { localStorage.setItem(LLAVE, JSON.stringify(h)); } catch (e) {} };
  try { if (localStorage.getItem(LLAVE_OCULTO) === hoyStr()) return; } catch (e) {}

  let hijo = leer() || { id: null, nombre: "Lunito", color: "lila", comidaAt: Date.now() - 2 * 3600e3 };
  const raiz = script && script.src ? script.src.replace(/mascota\.js.*$/, "") : "";

  function iniciar() {
    const caja = document.createElement("div");
    caja.id = "hijito-paseo";
    caja.style.setProperty("--hj-alto", (Number(script && script.dataset.alto) || 0) + "px");
    caja.innerHTML = `<button class="hj-boton" type="button" aria-label="${hijo.nombre}, tu hijito. Toca para cuidarlo"><div class="hj-giro"><div class="hj">${dibujo(hijo.color)}</div></div></button>`;
    document.body.appendChild(caja);
    const hj = caja.querySelector(".hj"), giro = caja.querySelector(".hj-giro"), boton = caja.querySelector(".hj-boton");

    const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = Math.random() * Math.max(40, innerWidth - 80) + 10, meta = x, dir = 1;
    let modo = "quieto"; // quieto | camina | duerme | come | feliz
    let esperaHasta = performance.now() + 1500;
    let ultimoMovimiento = Date.now();
    let globo = null, globoT = 0, menu = null;
    const W = () => caja.offsetWidth || 52;

    function poner(m) {
      modo = m;
      hj.className = "hj" + (m === "camina" ? " hj-camina" : m === "duerme" ? " hj-duerme" : m === "come" ? " hj-come" : m === "feliz" ? " hj-feliz" : "")
        + (m !== "duerme" && m !== "come" && m !== "feliz" && pancita(hijo.comidaAt) < 0.5 ? " hj-hambre" : "");
      const z = caja.querySelector(".hj-zzz");
      if (m === "duerme" && !z) hj.insertAdjacentHTML("beforeend", '<span class="hj-zzz"><i>z</i><i>z</i><i>Z</i></span>');
      if (m !== "duerme" && z) z.remove();
    }

    function decir(texto, ms = 2800) {
      if (menu) return;
      if (globo) globo.remove();
      globo = document.createElement("div");
      globo.className = "hj-globo"; globo.setAttribute("role", "status"); globo.textContent = texto;
      document.body.appendChild(globo);
      colocarGlobo();
      clearTimeout(globoT);
      globoT = setTimeout(() => { if (globo) { globo.remove(); globo = null; } }, ms);
    }
    function colocarGlobo() {
      if (!globo) return;
      const r = caja.getBoundingClientRect();
      const gw = globo.offsetWidth;
      globo.style.left = Math.min(innerWidth - gw - 8, Math.max(8, r.left + r.width * 0.6)) + "px";
      globo.style.top = (r.top - globo.offsetHeight - 6) + "px";
    }

    function corazones() {
      const c = document.createElement("span");
      c.className = "hj-corazones";
      c.innerHTML = [-14, 0, 14].map((dx, i) => `<i style="--x:${dx}px;animation-delay:${i * 0.12}s">♥</i>`).join("");
      hj.appendChild(c); setTimeout(() => c.remove(), 1700);
    }

    /* ----- movimiento ----- */
    let antes = performance.now();
    function cuadro(t) {
      const dt = Math.min(0.05, (t - antes) / 1000); antes = t;
      const maxX = innerWidth - W() - 6;
      if (x > maxX) x = maxX;
      if (modo === "camina") {
        const vel = (pancita(hijo.comidaAt) < 0.5 ? 18 : 30) * dt;
        if (Math.abs(meta - x) <= vel) { x = meta; poner("quieto"); esperaHasta = t + 2000 + Math.random() * 5000; }
        else x += Math.sign(meta - x) * vel;
      } else if (modo === "quieto" && t > esperaHasta && !menu) {
        if (Date.now() - ultimoMovimiento > SUENO_MS) { poner("duerme"); decir("Zzz… me dio sueñito", 2200); }
        else {
          meta = Math.max(6, Math.min(maxX, x + (Math.random() - 0.5) * Math.min(420, innerWidth * 0.8)));
          dir = meta >= x ? 1 : -1; giro.style.setProperty("--hj-dir", dir);
          if (!reducir) poner("camina"); else esperaHasta = t + 8000;
        }
      }
      caja.style.setProperty("--hj-x", x + "px");
      if (globo) colocarGlobo();
      requestAnimationFrame(cuadro);
    }
    poner("quieto");
    requestAnimationFrame(cuadro);

    /* ----- si lo dejas solo, se duerme; si vuelves, despierta ----- */
    const despierta = () => {
      const estabaDormido = modo === "duerme";
      ultimoMovimiento = Date.now();
      if (estabaDormido) { poner("feliz"); decir(["¡Ya volviste! ♡", "¡Holi!", "Mmm… ¿ya es de día?"][Math.floor(Math.random() * 3)]); setTimeout(() => poner("quieto"), 1100); }
    };
    ["pointermove", "pointerdown", "keydown", "scroll", "touchstart", "wheel"].forEach(ev => addEventListener(ev, despierta, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (document.hidden) ultimoMovimiento = Date.now() - SUENO_MS; });

    /* ----- pide comida ----- */
    function revisarHambre() {
      if (modo === "duerme" || menu) return;
      const p = pancita(hijo.comidaAt);
      if (p < 0.5) {
        poner(modo);
        decir(p < 0.2 ? `${hijo.nombre} tiene mucha hambre… 🥺` : ["Tengo hambre…", "¿Me das algo de comer?", "Mi pancita hace grrr"][Math.floor(Math.random() * 3)], 3600);
      }
    }
    setTimeout(revisarHambre, 6000);
    setInterval(revisarHambre, 45000);

    /* ----- menú al tocarlo ----- */
    function cerrarMenu() { if (menu) { menu.remove(); menu = null; } }
    function abrirMenu() {
      if (menu) return cerrarMenu();
      if (globo) { globo.remove(); globo = null; }
      ultimoMovimiento = Date.now();
      if (modo === "camina") { meta = x; }
      poner("feliz"); corazones();
      setTimeout(() => { if (modo === "feliz") poner("quieto"); }, 1000);
      const p = pancita(hijo.comidaAt);
      menu = document.createElement("div");
      menu.className = "hj-menu"; menu.setAttribute("role", "dialog"); menu.setAttribute("aria-label", "Cuidar a " + hijo.nombre);
      menu.innerHTML = `<h4>${esc(hijo.nombre)}</h4>
        <p>${p < 0.2 ? "Tiene mucha hambre" : p < 0.5 ? "Ya le está dando hambre" : p < 0.85 ? "Está contento" : "Tiene la pancita llena"}</p>
        <div class="hj-barra" aria-label="Pancita"><i style="width:${Math.round(p * 100)}%"></i></div>
        <div class="hj-comidas">${COMIDAS.map(([e, nm]) => `<button type="button" data-comida="${e}"><span>${e}</span>${nm}</button>`).join("")}</div>
        <div class="hj-fila"><button type="button" data-accion="mimo">💗 Apapachar</button><button type="button" data-accion="saluda">👋 Saludar</button></div>
        <a href="${raiz}hijitos">Ver a mis hijitos →</a>
        <button type="button" class="hj-esconder" data-accion="esconder">Esconderlo por hoy</button>`;
      document.body.appendChild(menu);
      const r = caja.getBoundingClientRect();
      menu.style.left = Math.min(innerWidth - menu.offsetWidth - 10, Math.max(10, r.left + r.width / 2 - menu.offsetWidth / 2)) + "px";
      menu.style.top = Math.max(10, r.top - menu.offsetHeight - 10) + "px";
      menu.addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.comida) return comer(b.dataset.comida, b);
        if (b.dataset.accion === "mimo") { cerrarMenu(); mimo(); }
        if (b.dataset.accion === "saluda") { cerrarMenu(); poner("feliz"); decir(["¡Hola! ♡", "¡Te quiero mucho!", "¡Hoy te ves bien bonita!", "¡Hola, hola!"][Math.floor(Math.random() * 4)]); setTimeout(() => poner("quieto"), 1100); }
        if (b.dataset.accion === "esconder") { cerrarMenu(); try { localStorage.setItem(LLAVE_OCULTO, hoyStr()); } catch (er) {} caja.classList.add("oculto"); setTimeout(() => caja.remove(), 400); }
      });
    }
    boton.addEventListener("click", e => { e.stopPropagation(); abrirMenu(); });
    document.addEventListener("click", e => { if (menu && !menu.contains(e.target) && !caja.contains(e.target)) cerrarMenu(); });
    addEventListener("keydown", e => { if (e.key === "Escape") cerrarMenu(); });

    function comer(emoji, desde) {
      const a = desde.getBoundingClientRect(), b = caja.getBoundingClientRect();
      const v = document.createElement("span");
      v.className = "hj-comida-vuela"; v.textContent = emoji;
      v.style.left = a.left + a.width / 2 - 11 + "px"; v.style.top = a.top + "px";
      v.style.setProperty("--dx", (b.left + b.width / 2 - a.left - a.width / 2) + "px");
      v.style.setProperty("--dy", (b.top + b.height * 0.55 - a.top) + "px");
      document.body.appendChild(v); setTimeout(() => v.remove(), 600);
      cerrarMenu();
      setTimeout(() => {
        poner("come");
        hijo.comidaAt = Date.now(); guardar(hijo);
        setTimeout(() => { poner("feliz"); corazones(); decir(["¡Qué rico! Gracias ♡", "Ñam ñam ñam", "¡Mi favorito!"][Math.floor(Math.random() * 3)]); setTimeout(() => poner("quieto"), 1200); }, 1600);
        if (hijo.id) firebase().then(({ db, F }) => F.updateDoc(F.doc(db, "hijitos", hijo.id), {
          comidaAt: hijo.comidaAt, comidaPor: (window.Sesion && Sesion.nombre) || "", ultimaComida: emoji, carino: F.increment(4),
        })).catch(() => {});
      }, 520);
    }
    function mimo() {
      poner("feliz"); corazones(); setTimeout(corazones, 400);
      decir(["Prrr ♡", "¡Más apapachos!", "Te quiero"][Math.floor(Math.random() * 3)]);
      setTimeout(() => poner("quieto"), 1300);
      if (hijo.id) firebase().then(({ db, F }) => F.updateDoc(F.doc(db, "hijitos", hijo.id), { carino: F.increment(1), mimoAt: Date.now() })).catch(() => {});
    }

    /* ----- traer al hijito de verdad desde Firebase ----- */
    firebase().then(async ({ db, F }) => {
      const s = await F.getDocs(F.collection(db, "hijitos"));
      const lista = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.creadoAt || 0) - (b.creadoAt || 0));
      if (!lista.length) return;
      let elegido = null;
      try { elegido = localStorage.getItem("nadiapp-acompanante"); } catch (e) {}
      const h = lista.find(x => x.id === elegido) || lista[0];
      const cambioDibujo = h.color !== hijo.color;
      hijo = { id: h.id, nombre: h.nombre || "Lunito", color: h.color || "lila", comidaAt: h.comidaAt || 0 };
      guardar(hijo);
      boton.setAttribute("aria-label", `${hijo.nombre}, tu hijito. Toca para cuidarlo`);
      if (cambioDibujo) { hj.querySelector("svg").outerHTML = dibujo(hijo.color); }
      poner(modo);
    }).catch(() => {});
  }

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  if (document.body) iniciar(); else document.addEventListener("DOMContentLoaded", iniciar);
})();
