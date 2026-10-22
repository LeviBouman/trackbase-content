// Draft file handling: drafts/<slug>.json -> normalized post payload (HTML in both languages).
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { getGlossaryTerms, SITE, CONTENT_SITE, wordCount } from "./framer.mjs";
import { linkGlossaryTerms } from "./glossary.mjs";

marked.setOptions({ gfm: true, breaks: false });

/** Framer rich text wants simple HTML: p/h2/h3/ul/ol/li/a/strong/em/blockquote/table. */
export function markdownToFramerHtml(md) {
  let html = marked.parse(String(md || "")).trim();
  html = html
    .replace(/<h1[^>]*>/g, "<h2>").replace(/<\/h1>/g, "</h2>") // never an H1 inside the body
    .replace(/\s+id="[^"]*"/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/\n+/g, "");
  return html;
}

export function loadDraft(file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const required = ["slug", "title", "description", "author", "date"];
  for (const k of required) if (!raw[k]) throw new Error(`draft ${file}: missing ${k}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug)) throw new Error(`draft ${file}: slug must be kebab-case`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) throw new Error(`draft ${file}: date must be YYYY-MM-DD`);
  const contentHtml = raw.contentHtml || markdownToFramerHtml(raw.contentMarkdown);
  const contentHtmlNl = raw.contentHtmlNl || (raw.contentMarkdownNl ? markdownToFramerHtml(raw.contentMarkdownNl) : null);
  if (!contentHtml) throw new Error(`draft ${file}: contentHtml or contentMarkdown required`);
  return {
    slug: raw.slug,
    title: raw.title,
    titleNl: raw.titleNl || null,
    description: raw.description,
    descriptionNl: raw.descriptionNl || null,
    seoTitle: raw.seoTitle || raw.title,
    seoTitleNl: raw.seoTitleNl || raw.titleNl || null,
    seoDescription: raw.seoDescription || raw.description,
    seoDescriptionNl: raw.seoDescriptionNl || raw.descriptionNl || null,
    author: raw.author,
    author2: raw.author2 || null,
    date: raw.date,
    updated: raw.updated || null,
    contentHtml,
    contentHtmlNl,
    image: raw.image || `${CONTENT_SITE}/og/${raw.slug}.png`,
    imageAlt: raw.imageAlt || raw.title,
    glossaryMax: raw.glossaryMax ?? 5,
    glossaryExclude: raw.glossaryExclude || [],
  };
}

/** Applies glossary links to both languages; returns { contentHtml, contentHtmlNl, report }. */
export async function applyGlossary(framer, post) {
  const terms = await getGlossaryTerms(framer);
  const en = linkGlossaryTerms(post.contentHtml, terms, { lang: "en", max: post.glossaryMax, exclude: post.glossaryExclude });
  const nl = post.contentHtmlNl
    ? linkGlossaryTerms(post.contentHtmlNl, terms, { lang: "nl", max: post.glossaryMax, exclude: post.glossaryExclude })
    : { html: null, added: 0, slugs: [] };
  return { contentHtml: en.html, contentHtmlNl: nl.html, report: { en: en.slugs, nl: nl.slugs } };
}

export function validatePost(post) {
  const problems = [];
  const words = wordCount(post.contentHtml);
  if (words < 700) problems.push(`body has ${words} words, minimum is 700`);
  if (!/<h2/.test(post.contentHtml)) problems.push("body has no H2 headings");
  if (post.title.length > 70) problems.push(`title is ${post.title.length} chars (max 70)`);
  if (post.seoTitle.length > 60) problems.push(`seoTitle is ${post.seoTitle.length} chars (max 60)`);
  if (post.seoDescription.length > 160) problems.push(`seoDescription is ${post.seoDescription.length} chars (max 160)`);
  if (post.description.length > 220) problems.push(`description is ${post.description.length} chars (max 220)`);
  if (!post.contentHtmlNl) problems.push("no Dutch content (contentMarkdownNl / contentHtmlNl)");
  if (!post.titleNl) problems.push("no Dutch title");
  const internal = (post.contentHtml.match(new RegExp(`href="${SITE.replace(/\./g, "\\.")}`, "g")) || []).length + (post.contentHtml.match(/href="\//g) || []).length;
  if (internal < 2) problems.push(`only ${internal} internal links (minimum 2)`);
  if (/\b(as an ai|i cannot|lorem ipsum)\b/i.test(post.contentHtml)) problems.push("placeholder or AI-disclaimer text found");
  return problems;
}

export function draftPath(root, slug) {
  return path.join(root, "pipeline", "drafts", `${slug}.json`);
}
