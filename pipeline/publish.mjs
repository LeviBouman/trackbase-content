// Publish main to production and verify the given paths are live.
// Usage: node pipeline/publish.mjs [--verify /blog/slug,/nl/blog/slug] [--expect "EN text"] [--expect-nl "NL text"] [--no-deploy]
// Without --expect / --expect-nl, each /blog/<slug> path must show the post's title and each
// /nl/blog/<slug> path its titleNl, both looked up in posts.json (run export-markdown first).
import fs from "node:fs";
import { getFramer, SITE, sleep } from "./lib/framer.mjs";

const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const paths = (argOf("--verify") || "").split(",").map((s) => s.trim()).filter(Boolean);
const expectEn = argOf("--expect");
const expectNl = argOf("--expect-nl");

const posts = (() => {
  try { return JSON.parse(fs.readFileSync(new URL("../posts.json", import.meta.url), "utf8")); } catch { return []; }
})();
function expectFor(p) {
  const nl = /^\/nl(\/|$)/.test(p);
  if (nl && expectNl) return expectNl;
  if (!nl && expectEn) return expectEn;
  const slug = p.match(/\/blog\/([^/?#]+)/)?.[1];
  const post = slug && posts.find((x) => x.slug === slug);
  return (nl ? post?.titleNl : post?.title) || null;
}
const decode = (html) =>
  html
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const framer = await getFramer();
const branches = await framer.getBranches();
if (!branches.some((b) => b.id === "main")) throw new Error("main branch missing?");
const before = await framer.getPublishInfo();
console.log("last production deploy:", new Date(before.production?.deploymentTime || 0).toISOString());

console.log("publishing main ...");
const result = await framer.publish();
const dep = result.deployment;
console.log("deployment", dep.id, "status", dep.status);
let status = dep.status;
for (let i = 0; i < 60 && !/success|ready|complete|deployed|live/i.test(String(status)) && !/fail|error/i.test(String(status)); i++) {
  await sleep(5000);
  const info = await framer.getPublishInfo().catch(() => null);
  status = info?.production?.deploymentTime > (before.production?.deploymentTime || 0) ? "deployed" : status;
  if (i % 6 === 5) console.log("  waiting ...", status);
}
if (/fail|error/i.test(String(status))) throw new Error(`deployment failed: ${JSON.stringify(dep).slice(0, 500)}`);

if (!args.includes("--no-deploy")) {
  const hosts = await framer.deploy(dep.id).catch((e) => { console.warn("deploy() warning:", e.message); return null; });
  if (hosts) console.log("deployed to", hosts.map((h) => h.hostname || h.name || JSON.stringify(h)).join(", "));
}

const after = await framer.getPublishInfo();
console.log("production deploy now:", new Date(after.production?.deploymentTime || 0).toISOString());

let failed = 0;
for (const p of paths) {
  const url = `${SITE}${p}`;
  const expect = expectFor(p);
  let ok = false, note = "";
  for (let attempt = 1; attempt <= 6 && !ok; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (trackbase-content pipeline)", "Cache-Control": "no-cache" } });
    const html = await res.text();
    const big = html.length > 60000; // Framer sometimes answers with a ~25 KB empty shell
    const has = expect ? decode(html).includes(expect) : true;
    ok = res.status === 200 && big && has;
    note = `${res.status} ${html.length} bytes${expect ? (has ? " expect:ok" : ` expect:MISSING "${expect}"`) : " (no title check)"}`;
    if (!ok) await sleep(10000);
  }
  console.log(ok ? "LIVE " : "FAIL ", url, note);
  if (!ok) failed++;
}
if (failed) { console.error(`${failed} path(s) not verified live`); process.exit(3); }
process.exit(0);
