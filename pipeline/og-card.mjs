// Generate a 1200x675 OG title card in the existing Trackbase blog style (Node version, no Python needed).
// Usage: node pipeline/og-card.mjs --slug my-post --title "My title" [--out og/my-post.png]
// Same look as og-card.py: navy background, light-blue brand line, bold white title, footer, blue bar.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = path.join(ROOT, "pipeline", "fonts");
const args = process.argv.slice(2);
const argOf = (k, d = null) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const slug = argOf("--slug");
const title = argOf("--title");
if (!slug || !title) { console.error("usage: --slug <slug> --title <title> [--out file]"); process.exit(1); }
const out = argOf("--out", path.join(ROOT, "og", `${slug}.png`));

GlobalFonts.registerFromPath(path.join(FONTS, "DejaVuSans-Bold.ttf"), "DejaVuCard");
GlobalFonts.registerFromPath(path.join(FONTS, "DejaVuSans.ttf"), "DejaVuCardRegular");

const W = 1200, H = 675;
const BG = "rgb(14,29,69)", BAR = "rgb(24,102,225)", MUTED = "rgb(171,201,243)", WHITE = "#fff";
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");
ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
ctx.fillStyle = BAR; ctx.fillRect(0, H - 20, W, 20);
ctx.textBaseline = "top";
ctx.fillStyle = MUTED; ctx.font = "30px DejaVuCardRegular"; ctx.fillText(argOf("--brand", "Trackbase"), 70, 70);

function wrap(text, maxW) {
  const words = text.split(/\s+/); const lines = []; let cur = "";
  for (const w of words) {
    const t = (cur + " " + w).trim();
    if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
let size = 64, lines = [], lineH = 0;
for (; size >= 40; size -= 4) {
  ctx.font = `bold ${size}px DejaVuCard`;
  lines = wrap(title, W - 140); lineH = Math.round(size * 1.2);
  if (lines.length * lineH <= 330) break;
}
ctx.font = `bold ${size}px DejaVuCard`;
let y = Math.max(170, Math.floor((H - 60 - lines.length * lineH) / 2) - 10);
ctx.fillStyle = WHITE;
for (const ln of lines) { ctx.fillText(ln, 70, y); y += lineH; }
ctx.fillStyle = MUTED; ctx.font = "30px DejaVuCardRegular"; ctx.fillText(argOf("--footer", "trackbase.ai"), 70, H - 90);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, canvas.toBuffer("image/png"));
console.log(out);
