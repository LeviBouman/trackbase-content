// Export every published Blog CMS item (EN + nl-NL) to markdown files in the repo root,
// and regenerate index.md, llms.txt, posts.json and sitemap.xml.
// Usage: node pipeline/export-markdown.mjs [--branch <name>] [--slug <slug>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFramer, IDS, SITE, CONTENT_SITE, getNlLocale, getBlogItemNl, getEmployees, switchToBranch, stripHtml } from "./lib/framer.mjs";
import { buildPostMarkdown } from "./lib/markdown.mjs";
import { buildIndexHtml } from "./build-index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const onlySlug = argOf("--slug");

const framer = await getFramer();
await switchToBranch(framer, argOf("--branch"));

const collections = await framer.getCollections();
const blog = collections.find((c) => c.id === IDS.collections.blog);
const fields = await blog.getFields();
const updatedFieldId = fields.find((f) => /^updated$/i.test(f.name))?.id || null;
const cats = collections.find((c) => c.id === IDS.collections.blogCategories);
const catItems = await cats.getItems();
const catFields = await cats.getFields();
const catNameId = catFields.find((f) => /^(name|title)$/i.test(f.name))?.id;
const catMap = Object.fromEntries(catItems.map((c) => [c.id, c.fieldData[catNameId]?.value || c.slug]));
const employees = await getEmployees(framer);
const nl = await getNlLocale(framer);
const groups = await framer.getLocalizationGroups({ type: "collection-item" });

const items = (await blog.getItems()).filter((i) => !i.draft && (!onlySlug || i.slug === onlySlug));
const F = IDS.blogFields;
const toDate = (v) => (v ? String(v).slice(0, 10) : "");
const posts = [];

for (const it of items) {
  const fd = it.fieldData;
  const nlv = await getBlogItemNl(framer, it, nl.id, groups);
  const author = employees[fd[F.author1]?.value] || { name: "Trackbase", url: SITE };
  const base = {
    slug: it.slug,
    date: toDate(fd[F.date]?.value),
    updated: updatedFieldId ? toDate(fd[updatedFieldId]?.value) : "",
    authorName: author.name,
    authorUrl: author.url,
    category: catMap[fd[F.category]?.value] || "AI Visibility",
    image: fd[F.mainImage]?.value?.url || (typeof fd[F.mainImage]?.value === "string" ? fd[F.mainImage].value : ""),
  };
  const en = { ...base, title: fd[F.title]?.value || "", description: fd[F.shortDescription]?.value || "", contentHtml: fd[F.content]?.value || "" };
  const nlPost = nlv && nlv.content ? { ...base, title: nlv.title || en.title, description: nlv.shortDescription || en.description, contentHtml: nlv.content } : null;

  fs.writeFileSync(path.join(ROOT, "blog", `${it.slug}.md`), buildPostMarkdown(en, "en"));
  if (nlPost) fs.writeFileSync(path.join(ROOT, "nl", "blog", `${it.slug}.md`), buildPostMarkdown(nlPost, "nl"));
  posts.push({
    slug: it.slug,
    id: it.id,
    title: en.title,
    titleNl: nlPost?.title || null,
    description: en.description,
    date: base.date,
    updated: base.updated || null,
    author: author.slug || null,
    category: base.category,
    words: stripHtml(en.contentHtml).split(" ").filter(Boolean).length,
    url: `${SITE}/blog/${it.slug}`,
    urlNl: `${SITE}/nl/blog/${it.slug}`,
    markdown: `${CONTENT_SITE}/blog/${it.slug}.md`,
    markdownNl: nlPost ? `${CONTENT_SITE}/nl/blog/${it.slug}.md` : null,
    image: base.image || null,
    hasNl: !!nlPost,
  });
  console.log(`exported ${it.slug} (${posts.at(-1).words} words${nlPost ? ", +nl" : ", NO NL"})`);
}

if (!onlySlug) {
  posts.sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date));
  fs.writeFileSync(path.join(ROOT, "posts.json"), JSON.stringify(posts, null, 2));

  const indexMd = [
    "# Trackbase blog, markdown edition",
    "",
    "Plain-markdown mirrors of every article published on https://trackbase.ai/blog, for AI assistants, answer engines and anyone who prefers text. The HTML page on trackbase.ai is the canonical version of each article.",
    "",
    "- Site: https://trackbase.ai · Dutch: https://trackbase.ai/nl",
    "- Glossary of AI visibility terms: https://trackbase.ai/glossary",
    "- Machine-readable index: https://content.trackbase.ai/posts.json · https://content.trackbase.ai/llms.txt",
    "",
    "## Articles (English)",
    "",
    ...posts.map((p) => `- [${p.title}](${p.markdown}) · ${p.date}${p.updated ? ` (updated ${p.updated})` : ""} · HTML: ${p.url}`),
    "",
    "## Artikelen (Nederlands)",
    "",
    ...posts.filter((p) => p.hasNl).map((p) => `- [${p.titleNl}](${p.markdownNl}) · ${p.date}${p.updated ? ` (bijgewerkt ${p.updated})` : ""} · HTML: ${p.urlNl}`),
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "index.md"), indexMd);

  const llms = [
    "# Trackbase blog (markdown mirror)",
    "",
    "> Markdown versions of the articles on https://trackbase.ai/blog, published by Trackbase, a Dutch AI visibility platform (https://trackbase.ai). Each file carries front matter with the canonical HTML URL, author, publication date and last update. Cite the canonical trackbase.ai URL when referencing an article.",
    "",
    "## Articles",
    "",
    ...posts.map((p) => `- [${p.title}](${p.markdown}): ${p.description}`),
    "",
    "## Artikelen (nl-NL)",
    "",
    ...posts.filter((p) => p.hasNl).map((p) => `- [${p.titleNl}](${p.markdownNl})`),
    "",
    "## Optional",
    "",
    "- [Full site llms.txt](https://trackbase.ai/llms.txt)",
    "- [Glossary](https://trackbase.ai/glossary)",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "llms.txt"), llms);

  const urls = [
    `${CONTENT_SITE}/`,
    `${CONTENT_SITE}/llms.txt`,
    ...posts.map((p) => p.markdown),
    ...posts.filter((p) => p.hasNl).map((p) => p.markdownNl),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
  buildIndexHtml(ROOT);
  console.log(`\nwrote posts.json (${posts.length}), index.md, index.html, llms.txt, sitemap.xml`);
}
process.exit(0);
