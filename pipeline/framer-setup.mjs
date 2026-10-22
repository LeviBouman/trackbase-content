// One-time Framer setup on a branch (Levi merges + publishes):
//  1. add an "Updated" date field to the Blog collection and fill it with each post's Date
//  2. add the MarkdownLink code component (visible "Read as Markdown" link, EN/NL aware)
//  3. give ArticleSchema a dateModified prop
//  4. place MarkdownLink + bind Updated/dateModified on the blog detail page
// Usage: node pipeline/framer-setup.mjs [--branch blog-pipeline] [--step fields|code|page|all]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFramer, IDS, sleep } from "./lib/framer.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const argOf = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const step = argOf("--step") || "all";
const branchTitle = argOf("--branch") || "blog-pipeline";

const framer = await getFramer();
let branches = await framer.getBranches();
let branch = branches.find((b) => b.title === branchTitle);
if (!branch) {
  branch = await framer.createBranch({ title: branchTitle, baseBranchId: "main" });
  console.log("created branch", branch.id, branch.title);
} else console.log("using branch", branch.id, branch.title);
await framer.agent.switchBranch(branch.id);
await sleep(10000);

const blog = (await framer.getCollections()).find((c) => c.id === IDS.collections.blog);

if (step === "fields" || step === "all") {
  let fields = await blog.getFields();
  let upd = fields.find((f) => /^updated$/i.test(f.name));
  if (!upd) {
    const created = await blog.addFields([{ name: "Updated", type: "date" }]);
    upd = created[0];
    console.log("added field Updated", upd.id);
    // place it right after Date
    fields = await blog.getFields();
    const order = fields.map((f) => f.id).filter((id) => id !== upd.id);
    order.splice(order.indexOf(IDS.blogFields.date) + 1, 0, upd.id);
    await blog.setFieldOrder(order);
  } else console.log("field Updated exists", upd.id);
  const items = await blog.getItems();
  let n = 0;
  for (const it of items) {
    const date = it.fieldData[IDS.blogFields.date]?.value;
    const cur = it.fieldData[upd.id]?.value;
    if (date && !cur) {
      await it.setAttributes({ fieldData: { [upd.id]: { type: "date", value: String(date).slice(0, 10) } } });
      n++;
    }
  }
  console.log(`Updated filled for ${n} items (= their Date)`);
}

if (step === "code" || step === "all") {
  const files = await framer.getCodeFiles();
  for (const name of ["MarkdownLink.tsx", "UpdatedLabel.tsx"]) {
    const src = fs.readFileSync(path.join(ROOT, "pipeline", "framer", name), "utf8");
    const existing = files.find((f) => f.name === name);
    try {
      if (!existing) { const cf = await framer.createCodeFile(name, src); console.log("created", name, cf.id); }
      else if ((existing.content ?? (await existing.getContent())) !== src) { await existing.setFileContent(src); console.log("updated", name, existing.id); }
      else console.log(name, "unchanged", existing.id);
    } catch (e) { console.warn(`${name} write warning (usually transient):`, e.message); }
    await sleep(10000);
  }

  const art = files.find((f) => f.name === "ArticleSchema.tsx");
  const src = art.content ?? (await art.getContent());
  if (!/dateModified/.test(src)) {
    let out = src
      .replace("const { headline, description, slug, datePublished, image,", "const { headline, description, slug, datePublished, dateModified, image,")
      .replace("if (datePublished) post.datePublished = datePublished", "if (datePublished) post.datePublished = datePublished\n    if (dateModified) post.dateModified = dateModified\n    else if (datePublished) post.dateModified = datePublished")
      .replace('datePublished: { type: ControlType.Date, title: "Date published" },', 'datePublished: { type: ControlType.Date, title: "Date published" },\n    dateModified: { type: ControlType.Date, title: "Date modified" },');
    if (out === src) throw new Error("ArticleSchema patch did not apply; check the source");
    try { await art.setFileContent(out); console.log("patched ArticleSchema.tsx with dateModified"); }
    catch (e) { console.warn("ArticleSchema write warning (usually transient):", e.message); }
    await sleep(10000);
  } else console.log("ArticleSchema already has dateModified");
}

if (step === "page" || step === "all") {
  const files = await framer.getCodeFiles();
  const md = files.find((f) => f.name === "MarkdownLink.tsx");
  const ul = files.find((f) => f.name === "UpdatedLabel.tsx");
  const fields = await blog.getFields();
  const upd = fields.find((f) => /^updated$/i.test(f.name));
  if (!md || !ul || !upd) throw new Error("run --step fields and --step code first");
  const pagePath = "/blog/:Blog";
  const pageId = IDS.pages.blogDetail;
  const xml = await framer.agent.serialize({ id: pageId, depth: 12 }, { pagePath });
  const txt = typeof xml === "string" ? xml : JSON.stringify(xml);
  fs.writeFileSync(path.join(ROOT, "pipeline", "tmp", "blog-detail.json"), txt);
  // Known nodes on the blog detail page (desktop primary; tablet/phone replicas inherit):
  //   hZiBjKXeC  ArticleSchema instance
  //   AH5_PUubE  "Top bar" (Back · Read time · Date), space-between row
  //   C5sAs5Oz9  Date rich text (toDateString transform)
  //   ljyQb_mKW  "Share Icons" column in the sidebar (holds "Summarize With")
  //   slug variable: var(--variable-oQdBtKrcK)
  const P = IDS.pageNodes.blogDetail;
  for (const [key, id] of Object.entries(P)) {
    const ok = key === "slugVariable" ? txt.includes(`var(--variable-${id})`) : txt.includes(`"id":"${id}"`);
    if (!ok) throw new Error(`expected ${key} ${id} not found on ${pagePath}; template changed, update IDS.pageNodes`);
  }
  const already = txt.includes(`codeFile/${md.id}:default`) || txt.includes(`codeFile/${ul.id}:default`);
  if (already) { console.log("page already has MarkdownLink/UpdatedLabel; skipping page step"); }
  else {
    // NOTE: DSL statements are separated by ";" — newlines are NOT separators.
    const dsl = [
      `SET ${P.articleSchema} name="Article schema (JSON-LD)" $control__dateModified="var(--variable-${upd.id})"`,
      `+FrameNode dates parent="${P.topBar}" index="2"`,
      `SET dates name="Dates" layout="stack" stackDirection="horizontal" stackAlignment="center" stackDistribution="start" gap="12px" width="auto" height="auto" overflow="visible"`,
      `MOVE ${P.dateText} parent="dates" index="0"`,
      `+ComponentInstanceNode updlbl component="codeFile/${ul.id}:default" parent="dates" index="1" $control__published="var(--variable-${IDS.blogFields.date})" $control__updated="var(--variable-${upd.id})" $control__color="var(--token-66b55331-5591-4930-80aa-9d1faeb41517)"`,
      `+ComponentInstanceNode mdlink component="codeFile/${md.id}:default" parent="${P.shareIcons}" index="99" $control__slug="var(--variable-${P.slugVariable})" $control__color="var(--token-2759885a-0605-4b0d-ae5f-9a938c3766f2)"`,
    ];
    console.log("DSL:\n" + dsl.join("\n"));
    const res = await framer.agent.applyChanges(dsl.join("; ") + ";", { pagePath });
    const raw = typeof res === "string" ? res : JSON.stringify(res || "");
    fs.writeFileSync(path.join(ROOT, "pipeline", "tmp", "apply-result.json"), raw);
    const msgs = raw.split(/\\n|\n/);
    const failed = msgs.filter((m) => /Commands:/.test(m));
    console.log(failed.length ? "COMMAND ERRORS:\n" + failed.join("\n") : "applied (lint notes ignored)");
    if (failed.length) process.exit(4);
  }
}

const changes = await framer.agent.getBranchChanges(branch.id).catch(() => []);
console.log("branch changes:", JSON.stringify(changes.map((c) => `${c.type}:${c.name}`)));
process.exit(0);
