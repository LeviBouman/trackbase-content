// Refresh an existing Blog CMS item: new content/SEO fields from a draft file and/or
// re-run the glossary linker, then stamp the Updated date (the original Date stays).
// Usage:
//   node pipeline/refresh-post.mjs --slug <slug> --draft pipeline/drafts/<slug>.refresh.json [--branch <name>] [--no-touch]
//   node pipeline/refresh-post.mjs --slug <slug> --relink            (glossary links only)
//   node pipeline/refresh-post.mjs --slug <slug> --touch --updated 2026-10-24   (date only; use sparingly)
import fs from "node:fs";
import { getFramer, IDS, getNlLocale, getBlogItemNl, setBlogItemNl, switchToBranch, sleep, wordCount, getGlossaryTerms, sameContent } from "./lib/framer.mjs";
import { markdownToFramerHtml } from "./lib/draft.mjs";
import { linkGlossaryTerms } from "./lib/glossary.mjs";

const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const slug = argOf("--slug");
if (!slug) throw new Error("--slug is required");
const today = new Date().toISOString().slice(0, 10);
const updatedDate = argOf("--updated") || today;

const framer = await getFramer();
await switchToBranch(framer, argOf("--branch"));
const nl = await getNlLocale(framer);
const blog = (await framer.getCollections()).find((c) => c.id === IDS.collections.blog);
const fields = await blog.getFields();
const updatedFieldId = fields.find((f) => /^updated$/i.test(f.name))?.id || null;
const F = IDS.blogFields;
let item = (await blog.getItems()).find((i) => i.slug === slug);
if (!item) throw new Error(`no item with slug ${slug}`);
const current = item.fieldData;
const currentNl = await getBlogItemNl(framer, item, nl.id);

const fieldData = {};
const wantNl = {};
let changed = [];

const draftFile = argOf("--draft");
if (draftFile) {
  const d = JSON.parse(fs.readFileSync(draftFile, "utf8"));
  const html = d.contentHtml || (d.contentMarkdown ? markdownToFramerHtml(d.contentMarkdown) : null);
  const htmlNl = d.contentHtmlNl || (d.contentMarkdownNl ? markdownToFramerHtml(d.contentMarkdownNl) : null);
  const setStr = (fieldId, en, nlVal, key) => {
    if (en == null) return;
    fieldData[fieldId] = { type: "string", value: en, ...(nlVal ? { valueByLocale: { [nl.id]: { action: "set", value: nlVal } } } : {}) };
    if (nlVal) wantNl[key] = nlVal;
    changed.push(key);
  };
  setStr(F.title, d.title, d.titleNl, "title");
  setStr(F.shortDescription, d.description, d.descriptionNl, "shortDescription");
  setStr(F.seoTitle, d.seoTitle, d.seoTitleNl, "seoTitle");
  setStr(F.seoDescription, d.seoDescription, d.seoDescriptionNl, "seoDescription");
  if (html) {
    fieldData[F.content] = { type: "formattedText", value: html, ...(htmlNl ? { valueByLocale: { [nl.id]: { action: "set", value: htmlNl } } } : {}) };
    if (htmlNl) wantNl.content = htmlNl;
    changed.push("content");
  }
  if (d.image) fieldData[F.mainImage] = { type: "image", value: d.image, alt: d.imageAlt || d.title || current[F.title]?.value };
  if (d.author && IDS.authors[d.author]) fieldData[F.author1] = { type: "collectionReference", value: IDS.authors[d.author] };
}

if (args.includes("--relink") || (draftFile && !fieldData[F.content])) {
  const terms = await getGlossaryTerms(framer);
  const enHtml = fieldData[F.content]?.value || current[F.content]?.value || "";
  const nlHtml = wantNl.content || currentNl?.content || null;
  const en = linkGlossaryTerms(enHtml, terms, { lang: "en", max: 5 });
  const nlRes = nlHtml ? linkGlossaryTerms(nlHtml, terms, { lang: "nl", max: 5 }) : { html: null, added: 0, slugs: [] };
  if (en.added || nlRes.added) {
    fieldData[F.content] = { type: "formattedText", value: en.html, ...(nlRes.html ? { valueByLocale: { [nl.id]: { action: "set", value: nlRes.html } } } : {}) };
    if (nlRes.html) wantNl.content = nlRes.html;
    changed.push(`glossary(en:${en.slugs.join("|")};nl:${nlRes.slugs.join("|")})`);
  } else {
    console.log("relink: nothing to add");
  }
}

const touch = args.includes("--touch") || (changed.length > 0 && !args.includes("--no-touch"));
if (touch) {
  if (!updatedFieldId) console.warn("No 'Updated' field on the Blog collection yet (run add-updated-field.mjs); skipping date stamp");
  else { fieldData[updatedFieldId] = { type: "date", value: updatedDate }; changed.push(`updated=${updatedDate}`); }
}

if (!Object.keys(fieldData).length) { console.log("nothing to change"); process.exit(0); }
if (args.includes("--dry-run")) { console.log(JSON.stringify({ slug, changed, words: wordCount(fieldData[F.content]?.value || current[F.content]?.value) }, null, 2)); process.exit(0); }

await item.setAttributes({ draft: item.draft, fieldData }); // pass draft explicitly so a draft never flips to published
console.log("updated", slug, "->", changed.join(", "));

if (Object.keys(wantNl).length) {
  await sleep(10000);
  item = (await blog.getItems()).find((i) => i.slug === slug);
  const got = await getBlogItemNl(framer, item, nl.id);
  const diff = Object.entries(wantNl).filter(([k, v]) => !sameContent(got?.[k], v)).map(([k]) => k);
  if (diff.length) {
    console.log("NL values changed by auto-translate, re-setting:", diff.join(", "));
    console.log("NL re-set:", (await setBlogItemNl(framer, item, nl.id, wantNl)) ? "ok" : "CHECK MANUALLY");
  } else console.log("NL values verified");
}
process.exit(0);
