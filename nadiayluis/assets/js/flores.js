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
  // Borde ondulado/rizado (claveles, cempasúchil, ranúnculos)
  function borde(rad, n, alto = 2.6, bajo = 1.2) {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, rr = rad + (i % 2 ? alto : -bajo);
      d += (i ? "L" : "M") + r(Math.cos(a) * rr) + " " + r(Math.sin(a) * rr);
    }
    return d + "Z";
  }

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
        // tallito y florecitas separadas, de abajo (grandes) hacia arriba (chiquitas)
        let s = `<path d="M0 0 L0 -50" stroke="#5d8a3a" stroke-width="1.8" stroke-linecap="round"/>`;
        for (let i = 0; i < 10; i++) {
          const y = -6 - i * 4.6, w = 3.4 - i * 0.17, lado = i % 2 ? 1 : -1;
          s += `<ellipse cx="${r(lado * 2.6)}" cy="${r(y)}" rx="${r(w)}" ry="${r(w * 0.8)}" fill="${p}" stroke="#00000030" stroke-width=".6"/>` +
               `<ellipse cx="${r(-lado * 2.2)}" cy="${r(y - 2.3)}" rx="${r(w * 0.85)}" ry="${r(w * 0.7)}" fill="${p}" opacity=".8" stroke="#00000025" stroke-width=".5"/>`;
        }
        return s + `<circle cx="0" cy="-53" r="1.8" fill="${p}"/>`;
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

    /* ---------- Flores nuevas ---------- */
    {
      id: "cempasuchil", nombre: "Cempasúchil",
      colores: [["#ff9f1c", "#f77f00"], ["#ffd23f", "#f4a100"], ["#ff7b00", "#e85d04"]],
      dibujo: ([p, o]) => `<path d="${borde(17, 34, 3, 1.5)}" fill="${o}" ${sombra}/><path d="${borde(13.5, 30, 2.6, 1.3)}" fill="${p}"/>
        <path d="${borde(10, 26, 2.2, 1)}" fill="${o}"/><path d="${borde(6.5, 20, 1.8, .8)}" fill="${p}"/><path d="${borde(3.4, 12, 1.2, .6)}" fill="${o}"/>`,
    },
    {
      id: "alcatraz", nombre: "Alcatraz",
      colores: [["#fffdf5", "#f5c518"], ["#f9d5e5", "#f5c518"], ["#fff1c1", "#f2a900"]],
      dibujo: ([p, c]) => `<path d="M0 0 C-4 -6 -14 -14 -16 -26 C-17 -36 -8 -44 4 -42 C14 -40 18 -30 12 -22 C8 -16 4 -8 0 0Z" fill="${p}" ${sombra}/>
        <path d="M-12 -30 C-8 -38 4 -40 10 -32 C4 -34 -4 -32 -12 -30Z" fill="#00000012"/>
        <path d="M0 -6 C-1 -14 -1 -22 1 -30" stroke="${c}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
    },
    {
      id: "gerbera", nombre: "Gerbera",
      colores: [["#ff5d73", "#3a2a1a"], ["#ffb703", "#5a3a1a"], ["#fb8500", "#3a2a1a"], ["#ffffff", "#7a5a2a"]],
      dibujo: ([p, c]) => petalos(22, 2.6, 10, 13, p, sombra) + petalos(16, 2.2, 7, 9, p, 'opacity=".9"', 11) +
        `<circle r="6.5" fill="${c}"/><circle r="6.5" fill="none" stroke="#f4d35e" stroke-width="1.6" stroke-dasharray="1 1.5"/><circle r="3" fill="#00000040"/>`,
    },
    {
      id: "peonia", nombre: "Peonía",
      colores: [["#ffb3c6", "#ff8fab"], ["#ffe5ec", "#ffc2d1"], ["#e5383b", "#ba181b"], ["#ffcad4", "#f4acb7"]],
      dibujo: ([p, o]) => petalos(7, 11, 11, 11, o, sombra) + petalos(7, 9.5, 9.5, 8, p, sombra, 25) + petalos(6, 7, 7, 5, o, "", 10) +
        petalos(5, 5, 5, 2.5, p, "", 40) + `<circle r="3.6" fill="${o}"/>`,
    },
    {
      id: "dalia", nombre: "Dalia",
      colores: [["#9d0208", "#d00000"], ["#ff70a6", "#ff9ebb"], ["#ffd60a", "#ffe566"], ["#7b2cbf", "#9d4edd"]],
      dibujo: ([p, l]) => puntas(16, 24, 5.5, p, sombra) + puntas(14, 18, 5, l, sombra, 11) + puntas(12, 12, 4.4, p, "", 5) +
        puntas(10, 7, 3.4, l, "", 18) + `<circle r="2.6" fill="${p}"/>`,
    },
    {
      id: "pensamiento", nombre: "Pensamiento",
      colores: [["#6a4c93", "#2d1a4a"], ["#f9c74f", "#5a189a"], ["#ffffff", "#3c096c"], ["#ff8fab", "#7b2cbf"]],
      dibujo: ([p, cara]) => `<ellipse cx="-7" cy="-9" rx="9" ry="10" fill="${p}" ${sombra} transform="rotate(-20 -7 -9)"/>
        <ellipse cx="7" cy="-9" rx="9" ry="10" fill="${p}" ${sombra} transform="rotate(20 7 -9)"/>
        <ellipse cx="-10" cy="2" rx="8.5" ry="8" fill="${p}" ${sombra}/><ellipse cx="10" cy="2" rx="8.5" ry="8" fill="${p}" ${sombra}/>
        <ellipse cx="0" cy="8" rx="11" ry="9" fill="${p}" ${sombra}/>
        <path d="M0 2 C-7 4 -9 10 -6 14 C-2 10 2 10 6 14 C9 10 7 4 0 2Z M-3 0 C-8 -2 -12 1 -13 4 C-9 3 -6 3 -3 2Z M3 0 C8 -2 12 1 13 4 C9 3 6 3 3 2Z" fill="${cara}" opacity=".85"/>
        <circle cy="1" r="2.4" fill="#ffd23f"/>`,
    },
    {
      id: "orquidea", nombre: "Orquídea",
      colores: [["#e0aaff", "#9d4edd"], ["#ffffff", "#ff70a6"], ["#ffc8dd", "#c9184a"], ["#fff3b0", "#e09f3e"]],
      dibujo: ([p, l]) => `<ellipse cx="0" cy="-15" rx="5" ry="11" fill="${p}" ${sombra}/>
        <ellipse cx="-12" cy="6" rx="4.5" ry="10" fill="${p}" ${sombra} transform="rotate(55 -12 6)"/>
        <ellipse cx="12" cy="6" rx="4.5" ry="10" fill="${p}" ${sombra} transform="rotate(-55 12 6)"/>
        <ellipse cx="-11" cy="-5" rx="10" ry="8" fill="${p}" ${sombra} transform="rotate(-20 -11 -5)"/>
        <ellipse cx="11" cy="-5" rx="10" ry="8" fill="${p}" ${sombra} transform="rotate(20 11 -5)"/>
        <path d="M-6 2 C-8 10 -4 16 0 16 C4 16 8 10 6 2 C3 4 -3 4 -6 2Z" fill="${l}"/>
        <ellipse cy="-1" rx="2.6" ry="3.6" fill="#fff8e1"/><circle cx="-2" cy="7" r=".9" fill="#fff"/><circle cx="2" cy="9" r=".9" fill="#fff"/>`,
    },
    {
      id: "anemona", nombre: "Anémona",
      colores: [["#e63946"], ["#ffffff"], ["#7b2cbf"], ["#ff8fab"]],
      dibujo: ([p]) => petalos(6, 10, 12, 10, p, sombra, 0) + `<circle r="7" fill="#1d1b3a"/>` + petalos(14, .8, 2.2, 9, "#1d1b3a", "") + `<circle r="3.4" fill="#3a3870"/>`,
    },
    {
      id: "jacinto", nombre: "Jacinto",
      colores: [["#7b8cde"], ["#ff8fab"], ["#f8f9fa"], ["#b388eb"]],
      dibujo: ([p]) => {
        let s = `<path d="M0 0 L0 -44" stroke="#5d8a3a" stroke-width="2.4" stroke-linecap="round"/>`;
        for (let i = 0; i < 16; i++) {
          const y = -6 - i * 2.6, x = (i % 4 - 1.5) * (4.6 - i * 0.12);
          s += `<g transform="translate(${r(x)} ${r(y)}) rotate(${i * 37})">${puntas(5, 4.4, 2.6, p, 'stroke="#00000022" stroke-width=".4"')}</g>`;
        }
        return s;
      },
    },
    {
      id: "ranunculo", nombre: "Ranúnculo",
      colores: [["#ff8fa3", "#ffb3c1"], ["#ffd166", "#ffe29a"], ["#f4f1de", "#e9e4c9"], ["#f3722c", "#f8961e"]],
      dibujo: ([p, l]) => petalos(9, 7.5, 7, 11, p, sombra) + petalos(8, 6.5, 6, 8, l, sombra, 22) + petalos(7, 5.2, 5, 5.5, p, sombra, 8) +
        petalos(6, 3.8, 3.6, 3, l, sombra, 30) + `<circle r="2.6" fill="${p}"/><circle r="1.2" fill="#6a994e"/>`,
    },
    {
      id: "nochebuena", nombre: "Nochebuena",
      colores: [["#d00000", "#9d0208"], ["#fff3f0", "#ffd6cc"], ["#ff4d6d", "#c9184a"]],
      dibujo: ([p, o]) => puntas(6, 25, 9, o, sombra, 30) + puntas(6, 21, 8, p, sombra) +
        [0, 1, 2, 3, 4].map(i => `<circle cx="${r(Math.cos(i * 1.26) * 2.6)}" cy="${r(Math.sin(i * 1.26) * 2.6)}" r="1.6" fill="#f4d35e" stroke="#6a994e" stroke-width=".6"/>`).join(""),
    },
    {
      id: "hortensia", nombre: "Hortensia",
      colores: [["#8ecae6", "#bde0fe"], ["#cdb4db", "#e2c4f0"], ["#ffafcc", "#ffc8dd"]],
      dibujo: ([p, l]) => {
        let s = `<circle r="17" fill="${p}" opacity=".5"/>`;
        for (let i = 0; i < 17; i++) {
          const a = i * 137.5 * Math.PI / 180, d = Math.sqrt(i / 17) * 13.5;
          s += `<g transform="translate(${r(Math.cos(a) * d)} ${r(Math.sin(a) * d)}) rotate(${i * 23})">${petalos(4, 2.4, 2.6, 2.4, i % 2 ? p : l, 'stroke="#00000018" stroke-width=".4"')}<circle r=".8" fill="#fff8"/></g>`;
        }
        return s;
      },
    },
    {
      id: "margarita-azul", nombre: "Aster",
      colores: [["#6c63ff", "#ffd23f"], ["#c77dff", "#ffd23f"], ["#ff6b9d", "#ffd23f"]],
      dibujo: ([p, c]) => petalos(24, 1.8, 10, 11, p, "") + `<circle r="5" fill="${c}"/><circle r="5" fill="none" stroke="#e09f3e" stroke-width="1"/>`,
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
