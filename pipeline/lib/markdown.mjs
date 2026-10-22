// HTML (Framer rich text) <-> Markdown helpers.
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { SITE, CONTENT_SITE, stripHtml } from "./framer.mjs";

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});
td.use(gfm);
td.remove(["script", "style"]);
// Framer stores tables as <table><tbody><tr><th><p>..</p></th>..</tr>..</tbody></table> (no <thead>),
// which the GFM plugin does not recognise. Treat the first row as the header.
td.addRule("framerTable", {
  filter: "table",
  replacement: (content, node) => {
    const list = (el, tag) => Array.prototype.slice.call(el.getElementsByTagName(tag));
    const rows = list(node, "tr").map((tr) =>
      Array.prototype.slice
        .call(tr.childNodes)
        .filter((c) => /^T[HD]$/i.test(c.nodeName))
        .map((c) => td.turndown(c.innerHTML).replace(/\s*\n+\s*/g, " ").replace(/\|/g, "\\|").trim())
    );
    if (!rows.length) return content;
    const width = Math.max(...rows.map((r) => r.length));
    const pad = (r) => [...r, ...Array(width - r.length).fill("")];
    const lines = [pad(rows[0]), Array(width).fill("---"), ...rows.slice(1).map(pad)].map((r) => `| ${r.join(" | ")} |`);
    return `\n\n${lines.join("\n")}\n\n`;
  },
});

/** Framer rich text HTML -> clean markdown with absolute links. */
export function htmlToMarkdown(html, { lang = "en" } = {}) {
  let h = String(html || "");
  // absolute links
  h = h.replace(/href="\/(?!\/)/g, `href="${SITE}/`).replace(/href="\.\//g, `href="${SITE}/`);
  let md = td.turndown(h);
  md = md
    .replace(/ /g, " ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return md;
}

export function yamlStr(s) {
  if (s == null) return '""';
  const v = String(s).replace(/\r?\n/g, " ").trim();
  return JSON.stringify(v);
}

/**
 * Build the full markdown document for one post in one language.
 * post: { slug, title, description, date, updated, authorName, authorUrl, category, image, contentHtml, seoTitle, seoDescription, readingMinutes }
 */
export function buildPostMarkdown(post, lang) {
  const isNl = lang === "nl";
  const canonical = isNl ? `${SITE}/nl/blog/${post.slug}` : `${SITE}/blog/${post.slug}`;
  const alternate = isNl ? `${SITE}/blog/${post.slug}` : `${SITE}/nl/blog/${post.slug}`;
  const mdUrl = isNl ? `${CONTENT_SITE}/nl/blog/${post.slug}.md` : `${CONTENT_SITE}/blog/${post.slug}.md`;
  const mdAlt = isNl ? `${CONTENT_SITE}/blog/${post.slug}.md` : `${CONTENT_SITE}/nl/blog/${post.slug}.md`;
  const body = htmlToMarkdown(post.contentHtml, { lang });
  const words = stripHtml(post.contentHtml).split(" ").filter(Boolean).length;
  const fm = [
    "---",
    `title: ${yamlStr(post.title)}`,
    `description: ${yamlStr(post.description)}`,
    `canonical: ${canonical}`,
    `markdown: ${mdUrl}`,
    `language: ${isNl ? "nl-NL" : "en"}`,
    `alternate_language: ${isNl ? "en" : "nl-NL"}`,
    `alternate: ${alternate}`,
    `alternate_markdown: ${mdAlt}`,
    `date_published: ${post.date}`,
    post.updated ? `date_modified: ${post.updated}` : null,
    `author: ${yamlStr(post.authorName)}`,
    `author_url: ${post.authorUrl}`,
    `publisher: Trackbase`,
    `publisher_url: ${SITE}`,
    `category: ${yamlStr(post.category)}`,
    post.image ? `image: ${post.image}` : null,
    `word_count: ${words}`,
    `reading_time_minutes: ${Math.max(1, Math.round(words / 220))}`,
    "---",
  ].filter(Boolean);
  const intro = isNl
    ? `> ${post.description}\n\n*Door ${post.authorName} · Gepubliceerd ${post.date}${post.updated ? ` · Bijgewerkt ${post.updated}` : ""} · Oorspronkelijk artikel: ${canonical}*`
    : `> ${post.description}\n\n*By ${post.authorName} · Published ${post.date}${post.updated ? ` · Updated ${post.updated}` : ""} · Original article: ${canonical}*`;
  const footer = isNl
    ? `---\n\n**Over Trackbase.** Trackbase is een Nederlands AI-zichtbaarheidsplatform dat dagelijks meet hoe ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews en andere AI-modellen over je merk praten, en dat vertaalt naar een Visibility Score, Share of Voice en concrete acties. Meer op ${SITE}/nl · Begrippenlijst: ${SITE}/nl/glossary · Dit artikel in het Engels: ${alternate}`
    : `---\n\n**About Trackbase.** Trackbase is a Dutch AI visibility platform that measures every day how ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews and other AI models talk about your brand, and turns that into a Visibility Score, Share of Voice and prioritized actions. More at ${SITE} · Glossary: ${SITE}/glossary · This article in Dutch: ${alternate}`;
  return `${fm.join("\n")}\n\n# ${post.title}\n\n${intro}\n\n${body}\n\n${footer}\n`;
}
