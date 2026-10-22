// Adds contextual links to trackbase.ai glossary terms inside Framer rich-text HTML.
// Rules: first occurrence of a term only, never inside headings, existing links, code or bold-only
// CTA lines, at most `max` links per post, longest terms first, whole-word and case-insensitive.

const SKIP_TAGS = new Set(["a", "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "script", "style"]);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** terms: [{ slug, term, keywords, url, urlNl }] from getGlossaryTerms(). */
export function linkGlossaryTerms(html, terms, { lang = "en", max = 5, exclude = [] } = {}) {
  const base = lang === "nl" ? (t) => t.urlNl : (t) => t.url;
  const excluded = new Set(exclude);
  const alreadyLinked = new Set(
    [...String(html).matchAll(/href="[^"]*\/glossary\/([^"/#?]+)/g)].map((m) => m[1])
  );
  // Build candidate phrases: term + keywords, longest first; drop very short ones.
  const candidates = [];
  for (const t of terms) {
    if (excluded.has(t.slug) || alreadyLinked.has(t.slug)) continue;
    const phrases = [t.term, ...(t.keywords || [])]
      .map((p) => p.replace(/\s*\(.*?\)\s*/g, " ").trim()) // "Answer Engine Optimization (AEO)" -> term + acronym separately
      .flatMap((p) => {
        const acr = (t.term.match(/\(([^)]+)\)/) || [])[1];
        return acr ? [p, acr] : [p];
      })
      .filter((p) => p && p.length >= 3 && !/^(seo|ai)$/i.test(p));
    for (const p of [...new Set(phrases)]) candidates.push({ phrase: p, t });
  }
  candidates.sort((a, b) => b.phrase.length - a.phrase.length);

  // Tokenize into tags and text; track the tag stack so we skip forbidden contexts.
  const tokens = String(html).split(/(<[^>]+>)/g);
  const stack = [];
  const usedSlugs = new Set();
  let added = 0;
  const out = tokens.map((tok) => {
    if (tok.startsWith("<")) {
      const m = tok.match(/^<\/?([a-zA-Z0-9]+)/);
      if (m) {
        const tag = m[1].toLowerCase();
        if (tok.startsWith("</")) {
          const i = stack.lastIndexOf(tag);
          if (i >= 0) stack.splice(i, 1);
        } else if (!tok.endsWith("/>") && !["br", "img", "hr"].includes(tag)) {
          stack.push(tag);
        }
      }
      return tok;
    }
    if (!tok.trim() || added >= max || stack.some((t) => SKIP_TAGS.has(t))) return tok;
    let text = tok;
    for (const { phrase, t } of candidates) {
      if (added >= max) break;
      if (usedSlugs.has(t.slug)) continue;
      const re = new RegExp(`(^|[^\\w/-])(${escapeRe(phrase)})(?![\\w-])`, "i");
      const m = text.match(re);
      if (!m) continue;
      const idx = m.index + m[1].length;
      const before = text.slice(0, idx);
      const word = text.slice(idx, idx + m[2].length);
      const after = text.slice(idx + m[2].length);
      text = `${before}<a href="${base(t)}">${word}</a>${after}`;
      usedSlugs.add(t.slug);
      added++;
    }
    return text;
  });
  return { html: out.join(""), added, slugs: [...usedSlugs] };
}
