// Compila LuNad a la carpeta ../lunad-app (la que publica GitHub Pages)
// Uso:  bun install   (solo la primera vez)
//       bun run build
const r = await Bun.build({
  entrypoints: ["./src/main.tsx"],
  outdir: "../lunad-app",
  naming: "app.[ext]",
  target: "browser",
  minify: true,
  sourcemap: "none",
  define: { "process.env.NODE_ENV": '"production"' },
});
if (!r.success) { console.error(r.logs); process.exit(1); }
for (const o of r.outputs) console.log("✓", o.path.split("/").slice(-2).join("/"), (o.size / 1024).toFixed(1) + " KB");
