// Create a new Blog CMS item (EN + nl-NL) from a draft file.
// Usage: node pipeline/create-post.mjs --draft pipeline/drafts/<slug>.json [--branch <name>] [--dry-run] [--allow-short]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFramer, IDS, getNlLocale, getBlogItemNl, setBlogItemNl, switchToBranch, sleep, wordCount, sameContent } from "./lib/framer.mjs";
import { loadDraft, applyGlossary, validatePost } from "./lib/draft.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const draftFile = argOf("--draft");
if (!draftFile) throw new Error("--draft <file> is required");
const dryRun = args.includes("--dry-run");

const post = loadDraft(draftFile);
const problems = validatePost(post);
if (problems.length) {
  console.error("Draft problems:\n- " + problems.join("\n- "));
  if (!args.includes("--allow-short")) process.exit(2);
}

const framer = await getFramer();
await switchToBranch(framer, argOf("--branch"));
const nl = await getNlLocale(framer);
const blog = (await framer.getCollections()).find((c) => c.id === IDS.collections.blog);
const fields = await blog.getFields();
const updatedFieldId = fields.find((f) => /^updated$/i.test(f.name))?.id || null;

const existing = (await blog.getItems()).find((i) => i.slug === post.slug);
if (existing) throw new Error(`slug already exists: ${post.slug} (${existing.id}); use refresh-post.mjs`);

const { contentHtml, contentHtmlNl, report } = await applyGlossary(framer, post);
console.log("glossary links:", JSON.stringify(report));

const authorId = IDS.authors[post.author];
if (!authorId) throw new Error(`unknown author slug: ${post.author}`);

// Image: Framer fetches image URLs itself, which fails while content.trackbase.ai is not yet
// reachable. If the OG card exists locally (og/<slug>.png) upload the bytes directly instead.
let imageValue = post.image;
const localOg = path.join(ROOT, "og", `${post.slug}.png`);
if (fs.existsSync(localOg) && !dryRun) {
  const asset = await framer.uploadImage({
    image: { bytes: new Uint8Array(fs.readFileSync(localOg)), mimeType: "image/png" },
    name: `${post.slug}.png`,
    altText: post.imageAlt,
  });
  imageValue = asset.url;
  console.log("uploaded OG card ->", imageValue);
}
const F = IDS.blogFields;
const loc = (v) => (v ? { [nl.id]: { action: "set", value: v } } : undefined);

const fieldData = {
  [F.title]: { type: "string", value: post.title, valueByLocale: loc(post.titleNl) },
  [F.category]: { type: "collectionReference", value: IDS.categoryAiVisibility },
  [F.date]: { type: "date", value: post.date },
  [F.mainImage]: { type: "image", value: imageValue, alt: post.imageAlt },
  [F.shortDescription]: { type: "string", value: post.description, valueByLocale: loc(post.descriptionNl) },
  [F.content]: { type: "formattedText", value: contentHtml, valueByLocale: loc(contentHtmlNl) },
  [F.author1]: { type: "collectionReference", value: authorId },
  [F.seoTitle]: { type: "string", value: post.seoTitle, valueByLocale: loc(post.seoTitleNl) },
  [F.seoDescription]: { type: "string", value: post.seoDescription, valueByLocale: loc(post.seoDescriptionNl) },
};
if (post.author2 && IDS.authors[post.author2]) fieldData[F.author2] = { type: "collectionReference", value: IDS.authors[post.author2] };
if (updatedFieldId) fieldData[updatedFieldId] = { type: "date", value: post.updated || post.date };

if (dryRun) {
  console.log(JSON.stringify({ slug: post.slug, words: wordCount(contentHtml), wordsNl: wordCount(contentHtmlNl), fieldData: Object.fromEntries(Object.entries(fieldData).map(([k, v]) => [k, { ...v, value: String(v.value).slice(0, 80) }])) }, null, 2));
  process.exit(0);
}

await blog.addItems([{ slug: post.slug, draft: false, fieldData }]);
await sleep(5000);
let item = (await blog.getItems()).find((i) => i.slug === post.slug);
if (!item) throw new Error("item not found after addItems");
console.log("created item", item.id, "slug", item.slug);

// Auto-translate may overwrite the Dutch values within seconds: verify and re-set.
await sleep(10000);
item = (await blog.getItems()).find((i) => i.slug === post.slug);
const got = await getBlogItemNl(framer, item, nl.id);
const want = { title: post.titleNl, shortDescription: post.descriptionNl, content: contentHtmlNl, seoTitle: post.seoTitleNl, seoDescription: post.seoDescriptionNl };
const diff = Object.entries(want).filter(([k, v]) => v && !sameContent(got?.[k], v)).map(([k]) => k);
if (diff.length) {
  console.log("NL values changed by auto-translate, re-setting:", diff.join(", "));
  const ok = await setBlogItemNl(framer, item, nl.id, want);
  console.log("NL re-set:", ok ? "ok" : "CHECK MANUALLY");
} else {
  console.log("NL values verified");
}

const outDir = path.join(ROOT, "pipeline", "tmp");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `created-${post.slug}.json`), JSON.stringify({ id: item.id, slug: post.slug, date: post.date, glossary: report }, null, 2));
console.log("done. Next: node pipeline/export-markdown.mjs && node pipeline/publish.mjs --verify /blog/" + post.slug + ",/nl/blog/" + post.slug);
process.exit(0);
