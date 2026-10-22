// Verify the blog detail template on a branch: nodes present, bindings, and a canvas screenshot.
// Usage: node pipeline/verify-template.mjs --branch blog-pipeline
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFramer, IDS, switchToBranch } from "./lib/framer.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const framer = await getFramer();
const branchId = await switchToBranch(framer, argOf("--branch"));
const pagePath = "/blog/:Blog";
const xml = await framer.agent.serialize({ id: IDS.pages.blogDetail, depth: 12 }, { pagePath });
const root = typeof xml === "string" ? JSON.parse(xml) : xml;
const found = [];
(function walk(n, parent) {
  if (!n || typeof n !== "object") return;
  const comp = n.component || "";
  if (/MarkdownLink|UpdatedLabel|HOL5bV4|WuhoNoO/.test(comp + (n.$componentDisplayName || "")) || n.name === "Dates" || n.id === "hZiBjKXeC") {
    found.push({ id: n.id, type: n.type, name: n.name || n.$componentDisplayName || "", parent, comp, attrs: JSON.stringify(n.attributes || {}).slice(0, 260) });
  }
  for (const c of n.children || []) walk(c, n.id);
})(root, null);
for (const f of found) console.log(JSON.stringify(f));
const files = await framer.getCodeFiles();
for (const n of ["MarkdownLink.tsx", "UpdatedLabel.tsx", "ArticleSchema.tsx"]) {
  const f = files.find((x) => x.name === n);
  const content = f?.content ?? (await f?.getContent?.());
  console.log(n, f ? `exports=${JSON.stringify((f.exports || []).map((e) => e.name || e.type))} dateModified=${/dateModified/.test(content || "")}` : "MISSING");
}
try {
  const shot = await framer.screenshot(IDS.pages.blogDetail, { format: "jpeg", scale: 0.5 });
  const out = path.join(ROOT, "pipeline", "tmp", `blog-detail-${branchId}.jpg`);
  const data = shot.data || shot.bytes || shot;
  fs.writeFileSync(out, Buffer.from(data instanceof ArrayBuffer ? new Uint8Array(data) : data));
  console.log("screenshot:", out, fs.statSync(out).size, "bytes");
} catch (e) { console.log("screenshot failed:", e.message); }
process.exit(0);
