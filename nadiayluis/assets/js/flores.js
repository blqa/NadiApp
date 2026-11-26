/* =========================================================
   LAS FLORES DEL RAMO
   Cada flor se dibuja con SVG. El punto (0,0) es donde
   termina el tallo; la flor mide más o menos 50 de ancho.
   Para agregar una flor nueva: agrega un objeto a FLORES
   con su nombre, sus colores y su función "dibujo".
   ========================================================= */
(function () {
  const r = n => Math.round(n * 10) / 10;

  // Pétalos repetidos alrededor del centro
  function petalos(n, rx, ry, dist, color, extra = "", giro = 0) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = giro + (360 / n) * i;
      s += `<ellipse cx="0" cy="${-dist}" rx="${rx}" ry="${ry}" fill="${color}" ${extra} transform="rotate(${r(a)})"/>`;
    }
    return s;
  }
  // Pétalo en punta (como de estrella)
  function puntas(n, largo, ancho, color, extra = "", giro = 0) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const a = giro + (360 / n) * i;
      s += `<path d="M0 0 C${ancho} ${-largo * 0.35} ${ancho * 0.6} ${-largo * 0.8} 0 ${-largo} C${-ancho * 0.6} ${-largo * 0.8} ${-ancho} ${-largo * 0.35} 0 0Z" fill="${color}" ${extra} transform="rotate(${r(a)})"/>`;
    }
    return s;
  }
  const sombra = 'stroke="#0000001f" stroke-width=".8"';

  const FLORES = [
    {
      id: "margarita", nombre: "Margarita",
      colores: [["#ffffff", "#f6c445"], ["#ffe3ec", "#f2b13a"], ["#ece4ff", "#f2b13a"]],
      dibujo: ([p, c]) => petalos(14, 4.2, 12, 12, p, sombra) + `<circle r="7.5" fill="${c}"/><circle r="7.5" fill="none" stroke="#c98a12" stroke-width="1" stroke-dasharray="1.5 2"/>`,
    },
    {
      id: "girasol", nombre: "Girasol",
      colores: [["#ffc928", "#6b3f1d"], ["#ffb02e", "#4a2a14"]],
      dibujo: ([p, c]) => puntas(18, 24, 6, p, sombra) + puntas(18, 19, 5, p, 'opacity=".85"', 10) +
        `<circle r="10" fill="${c}"/><circle r="10" fill="none" stroke="#00000033" stroke-width="2" stroke-dasharray="1 2.4"/><circle r="5" fill="#00000022"/>`,
    },
    {
      id: "amapola", nombre: "Amapola",
      colores: [["#e2382f", "#2b1a1a"], ["#ff7a3d", "#33201a"], ["#f2a0b5", "#3a2230"]],
      dibujo: ([p, c]) => petalos(5, 13, 13, 9, p, `${sombra} opacity=".95"`, 10) + petalos(5, 9, 9, 6, p, 'opacity=".6"', 46) +
        `<circle r="5.5" fill="${c}"/>` + petalos(8, .9, 3, 7, c, "", 0),
    },
    {
      id: "tulipan", nombre: "Tulipán",
      colores: [["#e93e57"], ["#ff8db1"], ["#ffcf3d"], ["#9b5de5"], ["#fff3e8"]],
      dibujo: ([p]) => `<path d="M-14 -6 C-16 -22 -10 -34 -3 -38 C-2 -30 -1 -22 0 -14 Z" fill="${p}" ${sombra}/>
        <path d="M14 -6 C16 -22 10 -34 3 -38 C2 -30 1 -22 0 -14 Z" fill="${p}" ${sombra}/>
        <path d="M-12 -4 C-13 -20 -6 -34 0 -40 C6 -34 13 -20 12 -4 C8 2 -8 2 -12 -4Z" fill="${p}" ${sombra}/>
        <path d="M-6 -6 C-6 -18 -3 -28 0 -34" fill="none" stroke="#ffffff55" stroke-width="2" stroke-linecap="round"/>`,
    },
    {
      id: "rosa", nombre: "Rosa",
      colores: [["#d7264d", "#a3173a"], ["#ff9fb5", "#e66f8e"], ["#fff1e6", "#f0cdb9"], ["#ffb36b", "#e07f2f"]],
      dibujo: ([p, o]) => petalos(5, 11, 12, 9, p, sombra, 15) +
        `<circle r="11" fill="${o}"/><path d="M-8 0 C-8 -9 8 -10 8 -2 C8 5 -2 7 -4 1 C-5 -4 3 -5 3 -1" fill="none" stroke="${p}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M-10 4 C-6 11 6 11 10 4" fill="none" stroke="${p}" stroke-width="2.2" stroke-linecap="round"/>`,
    },
    {
      id: "lavanda", nombre: "Lavanda",
      colores: [["#9b7fe0"], ["#7c5cc9"], ["#c3a6f0"]],
      dibujo: ([p]) => {
        let s = `<path d="M0 0 L0 -46" stroke="#5d8a3a" stroke-width="2"/>`;
        for (let i = 0; i < 9; i++) {
          const y = -8 - i * 4.8, w = 4.2 - i * 0.22;
          s += `<ellipse cx="${-w * 0.7}" cy="${y}" rx="${w}" ry="3.6" fill="${p}" transform="rotate(-25 ${-w * 0.7} ${y})"/><ellipse cx="${w * 0.7}" cy="${y - 2}" rx="${w}" ry="3.6" fill="${p}" transform="rotate(25 ${w * 0.7} ${y - 2})"/>`;
        }
        return s + `<ellipse cx="0" cy="-50" rx="2.6" ry="3.6" fill="${p}"/>`;
      },
    },
    {
      id: "cosmos", nombre: "Cosmos",
      colores: [["#f45d9c", "#f7c948"], ["#ffffff", "#f7c948"], ["#c2185b", "#f7c948"], ["#ffb3c8", "#f2b13a"]],
      dibujo: ([p, c]) => {
        let s = "";
        for (let i = 0; i < 8; i++) s += `<path d="M0 0 C6 -6 9 -16 8 -22 L4 -20 L0 -23 L-4 -20 L-8 -22 C-9 -16 -6 -6 0 0Z" fill="${p}" ${sombra} transform="rotate(${i * 45})"/>`;
        return s + `<circle r="5.5" fill="${c}"/><circle r="5.5" fill="none" stroke="#c98a12" stroke-width="1.2" stroke-dasharray="1 1.6"/>`;
      },
    },
    {
      id: "nomeolvides", nombre: "Nomeolvides",
      colores: [["#6aa9ff", "#ffe27a"], ["#a9c8ff", "#ffe27a"], ["#ffb6d0", "#ffe27a"]],
      dibujo: ([p, c]) => {
        const sitios = [[0, -4], [-11, 2], [11, 1], [-6, -14], [7, -13], [0, 10]];
        return sitios.map(([x, y]) => `<g transform="translate(${x} ${y})">${petalos(5, 3.6, 3.8, 3.6, p, "")}<circle r="1.9" fill="${c}"/></g>`).join("");
      },
    },
    {
      id: "lirio", nombre: "Lirio",
      colores: [["#ffd0dc", "#e0567c"], ["#ffffff", "#f29bb0"], ["#ffb36b", "#e2592e"]],
      dibujo: ([p, l]) => puntas(6, 26, 9, p, sombra, 30) +
        [0, 1, 2, 3, 4, 5].map(i => `<path d="M0 -4 L0 -17" stroke="${l}" stroke-width="2" stroke-linecap="round" transform="rotate(${30 + i * 60})"/>`).join("") +
        [0, 1, 2, 3, 4].map(i => `<g transform="rotate(${i * 72})"><path d="M0 0 L0 -12" stroke="#6b8f3a" stroke-width=".9"/><ellipse cy="-13" rx="1.2" ry="2.4" fill="#9a4b1d"/></g>`).join(""),
    },
    {
      id: "pompon", nombre: "Pompón",
      colores: [["#a66be0", "#c9a0f2"], ["#f07ab3", "#ffb8d9"], ["#ffffff", "#e8e0f4"]],
      dibujo: ([p, b]) => {
        let s = `<circle r="15" fill="${p}" opacity=".35"/>`;
        for (let i = 0; i < 26; i++) {
          const a = i * 137.5 * Math.PI / 180, d = Math.sqrt(i / 26) * 14;
          s += `<circle cx="${r(Math.cos(a) * d)}" cy="${r(Math.sin(a) * d)}" r="3.2" fill="${i % 3 ? p : b}"/>`;
        }
        return s;
      },
    },
    {
      id: "campanilla", nombre: "Campanilla",
      colores: [["#6f7bf7"], ["#b18cf2"], ["#5ec2e8"]],
      dibujo: ([p]) => {
        const campana = (x, y, g) => `<g transform="translate(${x} ${y}) rotate(${g})"><path d="M-8 0 C-8 -10 8 -10 8 0 L10 6 L6 4 L3 7 L0 4 L-3 7 L-6 4 L-10 6Z" fill="${p}" ${sombra}/></g>`;
        return `<path d="M0 0 C2 -14 10 -22 20 -24 M6 -14 C-4 -18 -12 -14 -16 -8" fill="none" stroke="#5d8a3a" stroke-width="2" stroke-linecap="round"/>` +
          campana(20, -18, 12) + campana(-16, -2, -10) + campana(0, -6, 0);
      },
    },
    {
      id: "clavel", nombre: "Clavel",
      colores: [["#ff5c8a", "#d6336c"], ["#ffffff", "#f3c6d3"], ["#e63946", "#b51f2e"]],
      dibujo: ([p, o]) => {
        const borde = (rad, n) => { let d = ""; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rr = rad + (i % 2 ? 2.6 : -1.2); d += (i ? "L" : "M") + r(Math.cos(a) * rr) + " " + r(Math.sin(a) * rr); } return d + "Z"; };
        return `<path d="${borde(15, 28)}" fill="${o}"/><path d="${borde(11.5, 24)}" fill="${p}" ${sombra}/><path d="${borde(7, 18)}" fill="${o}" opacity=".7"/><path d="${borde(4, 12)}" fill="${p}"/>`;
      },
    },
  ];

  // Hojita para los tallos
  const hoja = (largo = 16, color = "#6c9a43") =>
    `<path d="M0 0 C${largo * 0.35} ${-largo * 0.35} ${largo * 0.8} ${-largo * 0.3} ${largo} 0 C${largo * 0.7} ${largo * 0.25} ${largo * 0.3} ${largo * 0.25} 0 0Z" fill="${color}"/><path d="M1 0 L${largo * 0.85} 0" stroke="#ffffff33" stroke-width=".8"/>`;

  function cabeza(tipo, color) {
    const f = FLORES[tipo] || FLORES[0];
    return f.dibujo(f.colores[color % f.colores.length]);
  }

  window.FLORES = { lista: FLORES, cabeza, hoja };
})();
