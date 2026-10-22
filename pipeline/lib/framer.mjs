// Shared helpers for the trackbase.ai Framer project.
// Requires env: FRAMER_PROJECT_URL, FRAMER_API_KEY (never commit these).
import { connect } from "framer-api";

export const SITE = "https://trackbase.ai";
export const CONTENT_SITE = "https://content.trackbase.ai";

export const IDS = {
  collections: {
    blog: "xh1LtkXB8",
    blogCategories: "pa11cI05S",
    employees: "ffoJjwH6x",
    glossary: "L5lVuYiqj",
  },
  blogFields: {
    title: "yaNLAN1hN",
    category: "CFYd0SwtW",
    date: "p5peP8ErJ",
    mainImage: "xDjjiIyrc",
    shortDescription: "Rd6j4GOOr",
    content: "vbtLBmZr2",
    author1: "whdVPKWq1",
    author2: "E96a4dfiI",
    seoTitle: "AGbfpx8XN",
    seoDescription: "u0NEHvxkE",
    // "updated" is resolved by name at runtime (added by add-updated-field.mjs)
  },
  categoryAiVisibility: "a4znviGPY",
  authors: {
    "levi-bouman": "t13qMPJ4j",
    "bodrik-bakker": "Td8liaOFA",
  },
  pages: {
    blogOverview: "gBWWMHeaO",
    blogDetail: "CL7Uua0V7",
  },
  pageNodes: {
    blogDetail: {
      articleSchema: "hZiBjKXeC",
      topBar: "AH5_PUubE",
      dateText: "C5sAs5Oz9",
      shareIcons: "ljyQb_mKW",
      slugVariable: "oQdBtKrcK",
    },
  },
};

let _framer;
export async function getFramer() {
  if (_framer) return _framer;
  const url = process.env.FRAMER_PROJECT_URL;
  const key = process.env.FRAMER_API_KEY;
  if (!url || !key) throw new Error("FRAMER_PROJECT_URL and FRAMER_API_KEY must be set");
  process.on("uncaughtException", (e) => {
    console.error("uncaught:", e?.message || e);
    process.exit(1);
  });
  _framer = await connect(url, key);
  return _framer;
}

export async function switchToBranch(framer, titleOrId) {
  if (!titleOrId || titleOrId === "main") return "main";
  const branches = await framer.getBranches();
  const b = branches.find((x) => x.id === titleOrId || x.title === titleOrId);
  if (!b) throw new Error(`Branch not found: ${titleOrId}`);
  await framer.agent.switchBranch(b.id);
  await sleep(8000); // branch data settles after a switch
  return b.id;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html) {
  return stripHtml(html).split(" ").filter(Boolean).length;
}

export async function getNlLocale(framer) {
  const locales = await framer.getLocales();
  const nl = locales.find((l) => /^nl/i.test(l.code) || /nl-NL/i.test(l.code));
  if (!nl) throw new Error("nl-NL locale not found");
  return nl;
}

/** Returns { title, shortDescription, content, seoTitle, seoDescription, slug } in nl-NL for one blog item. */
export async function getBlogItemNl(framer, item, nlLocaleId, groups) {
  groups = groups || (await framer.getLocalizationGroups({ type: "collection-item" }));
  const group = groups.find((g) => (g.id && g.id.includes(item.id)) || g.name === item.slug);
  if (!group) return null;
  const sources = group.sources || [];
  const fd = item.fieldData || {};
  const F = IDS.blogFields;
  const nlFor = (enValue, type) => {
    if (enValue == null) return null;
    const src = sources.find((s) => s.value === enValue && (!type || s.type === type));
    return src?.valueByLocale?.[nlLocaleId]?.value ?? null;
  };
  const slugSrc = sources.find((s) => s.type === "slug");
  return {
    title: nlFor(fd[F.title]?.value, "string"),
    shortDescription: nlFor(fd[F.shortDescription]?.value, "string"),
    content: nlFor(fd[F.content]?.value, "formattedText"),
    seoTitle: nlFor(fd[F.seoTitle]?.value, "string"),
    seoDescription: nlFor(fd[F.seoDescription]?.value, "string"),
    slug: slugSrc?.valueByLocale?.[nlLocaleId]?.value || item.slug,
    _group: group,
  };
}

/** Set nl-NL values on localization sources matched by their English value. */
export async function setBlogItemNl(framer, item, nlLocaleId, values, { retries = 3 } = {}) {
  const F = IDS.blogFields;
  const fd = item.fieldData || {};
  const pairs = [
    [fd[F.title]?.value, values.title, "string"],
    [fd[F.shortDescription]?.value, values.shortDescription, "string"],
    [fd[F.content]?.value, values.content, "formattedText"],
    [fd[F.seoTitle]?.value, values.seoTitle, "string"],
    [fd[F.seoDescription]?.value, values.seoDescription, "string"],
  ].filter(([en, nl]) => en && nl);
  for (let attempt = 1; attempt <= retries; attempt++) {
    const groups = await framer.getLocalizationGroups({ type: "collection-item" });
    const group = groups.find((g) => (g.id && g.id.includes(item.id)) || g.name === item.slug);
    if (!group) throw new Error(`No localization group for item ${item.id}`);
    let pending = 0;
    for (const [en, nl, type] of pairs) {
      const src = (group.sources || []).find((s) => s.value === en && s.type === type);
      if (!src) { pending++; continue; }
      const current = src.valueByLocale?.[nlLocaleId]?.value;
      if (current === nl) continue;
      await framer.setLocalizationData({
        update: { [src.id]: { [nlLocaleId]: { action: "set", value: nl } } },
      });
      await sleep(400);
    }
    // Framer auto-translate can overwrite values set right after an English change: verify
    await sleep(8000);
    const check = await framer.getLocalizationGroups({ type: "collection-item" });
    const g2 = check.find((g) => (g.id && g.id.includes(item.id)) || g.name === item.slug);
    const wrong = pairs.filter(([en, nl, type]) => {
      const src = (g2?.sources || []).find((s) => s.value === en && s.type === type);
      return src && src.valueByLocale?.[nlLocaleId]?.value !== nl;
    });
    if (wrong.length === 0 && pending === 0) return true;
    if (attempt === retries) {
      console.warn(`NL values still differ after ${retries} attempts: ${wrong.length} wrong, ${pending} pending`);
      return false;
    }
  }
}

export async function getEmployees(framer) {
  const col = (await framer.getCollections()).find((c) => c.id === IDS.collections.employees);
  const fields = await col.getFields();
  const nameId = fields.find((f) => /^name$/i.test(f.name))?.id;
  const roleId = fields.find((f) => /role|title|function/i.test(f.name))?.id || null;
  const items = await col.getItems();
  const map = {};
  for (const it of items) {
    const rec = {
      id: it.id,
      slug: it.slug,
      name: it.fieldData[nameId]?.value || it.slug,
      role: roleId ? it.fieldData[roleId]?.value || "" : "",
      url: `${SITE}/blog/author/${it.slug}`,
    };
    map[it.id] = rec; // collectionReference values are stored as item id ...
    map[it.slug] = rec; // ... but read back as the referenced item's slug
  }
  return map;
}

export async function getGlossaryTerms(framer) {
  const col = (await framer.getCollections()).find((c) => c.id === IDS.collections.glossary);
  const fields = await col.getFields();
  const termId = fields.find((f) => f.name === "Term")?.id;
  const kwId = fields.find((f) => f.name === "Search Keywords")?.id;
  const defId = fields.find((f) => f.name === "Short Definition")?.id;
  const items = await col.getItems();
  return items
    .filter((i) => !i.draft)
    .map((i) => ({
      slug: i.slug,
      term: i.fieldData[termId]?.value || "",
      keywords: (i.fieldData[kwId]?.value || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean),
      definition: i.fieldData[defId]?.value || "",
      url: `${SITE}/glossary/${i.slug}`,
      urlNl: `${SITE}/nl/glossary/${i.slug}`,
    }));
}
