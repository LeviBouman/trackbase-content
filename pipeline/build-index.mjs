// Build index.html for content.trackbase.ai from posts.json (GitHub Pages serves no index.md).
// Usage: node pipeline/build-index.mjs   (also called by export-markdown.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function buildIndexHtml(root) {
  const posts = JSON.parse(fs.readFileSync(path.join(root, "posts.json"), "utf8"));
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const row = (p, nl) =>
    `<li><a href="${nl ? p.markdownNl : p.markdown}">${esc(nl ? p.titleNl : p.title)}</a> <span class="meta">${p.date}${p.updated && p.updated !== p.date ? ` · ${nl ? "bijgewerkt" : "updated"} ${p.updated}` : ""} · <a href="${nl ? p.urlNl : p.url}">HTML</a></span></li>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Trackbase blog, markdown edition</title>
<link rel="canonical" href="https://trackbase.ai/blog">
<style>
body{font-family:Inter,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;color:#0e1d45;line-height:1.5}
h1{font-size:28px;margin:0 0 8px}h2{font-size:20px;margin:32px 0 8px}
a{color:#1866e1;text-decoration:none}a:hover{text-decoration:underline}
li{margin:6px 0}.meta{color:#6b7a90;font-size:13px}
</style>
</head>
<body>
<h1>Trackbase blog, markdown edition</h1>
<p>Plain-markdown mirrors of every article on <a href="https://trackbase.ai/blog">trackbase.ai/blog</a>, published by <a href="https://trackbase.ai">Trackbase</a>, the AI visibility platform. The HTML page on trackbase.ai is the canonical version of each article. Machine-readable: <a href="/llms.txt">llms.txt</a> · <a href="/posts.json">posts.json</a> · <a href="/sitemap.xml">sitemap.xml</a> · <a href="https://trackbase.ai/glossary">glossary</a>.</p>
<h2>Articles (English)</h2>
<ul>
${posts.map((p) => row(p, false)).join("\n")}
</ul>
<h2>Artikelen (Nederlands)</h2>
<ul>
${posts.filter((p) => p.hasNl).map((p) => row(p, true)).join("\n")}
</ul>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, "index.html"), html);
  return posts.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  console.log("index.html written for", buildIndexHtml(root), "posts");
}
