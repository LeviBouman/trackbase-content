# trackbase-content

Markdown mirrors, OG images and the content pipeline for the [trackbase.ai](https://trackbase.ai) blog.

- **Published at:** https://content.trackbase.ai (GitHub Pages, custom domain, `.nojekyll` so `.md` files are served as-is)
- **Canonical articles:** https://trackbase.ai/blog (Framer CMS, EN + nl-NL)
- **What lives here:** `blog/<slug>.md`, `nl/blog/<slug>.md`, `og/<slug>.png`, `posts.json`, `llms.txt`, `sitemap.xml`, `robots.txt` and the scripts in `pipeline/`.

`robots.txt` blocks classic search engines (Googlebot, Bingbot) so the mirror never competes with trackbase.ai in web search, and explicitly allows AI crawlers and answer engines (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, ...).

## Pipeline

All scripts are Node 22 ES modules in `pipeline/` using the official `framer-api`. They read two environment variables and never store them:

```
FRAMER_PROJECT_URL=https://framer.com/projects/Trackbase-ai--iWfXq5iiNUZBVK9BxmzP-43FIb
FRAMER_API_KEY=<project API key from Framer Site Settings>
```

On Windows Git Bash also set `MSYS_NO_PATHCONV=1` so CMS paths like `/blog/:Blog` are not rewritten.

| Script | Purpose |
| --- | --- |
| `node pipeline/export-markdown.mjs [--slug x] [--branch b]` | CMS → `blog/*.md`, `nl/blog/*.md`, `posts.json`, `index.md`, `llms.txt`, `sitemap.xml` |
| `node pipeline/create-post.mjs --draft pipeline/drafts/<slug>.json [--branch b] [--dry-run]` | Validates a draft, links glossary terms (max 5 per language), creates the CMS item with EN + nl-NL in one call, verifies the Dutch values against auto-translate |
| `node pipeline/refresh-post.mjs --slug <slug> --draft pipeline/drafts/<slug>.refresh.json` | Rewrites fields of an existing post and stamps `Updated` (the original `Date` stays). `--relink` only adds glossary links |
| `node pipeline/og-card.mjs --slug <slug> --title "..."` | 1200×675 OG title card in the existing navy card style → `og/<slug>.png` (`og-card.py` is the Pillow equivalent) |
| `node pipeline/publish.mjs --verify /blog/<slug>,/nl/blog/<slug> --expect "<title>"` | Publishes **main** to production and checks that the paths answer with a full page |
| `node pipeline/framer-setup.mjs --branch blog-pipeline --step fields\|code\|page\|all` | One-time template setup (see below). Idempotent |
| `node pipeline/verify-template.mjs --branch b` | Lists the template nodes added by the setup and saves a canvas screenshot |

### Draft format (`pipeline/drafts/<slug>.json`)

```json
{
  "slug": "how-to-measure-ai-share-of-voice-in-2026",
  "title": "...", "titleNl": "...",
  "description": "...", "descriptionNl": "...",
  "seoTitle": "...", "seoTitleNl": "...",
  "seoDescription": "...", "seoDescriptionNl": "...",
  "author": "levi-bouman",
  "date": "2026-10-24",
  "contentMarkdown": "## First H2 ...",
  "contentMarkdownNl": "## Eerste H2 ...",
  "image": "https://content.trackbase.ai/og/<slug>.png",
  "imageAlt": "..."
}
```

`contentHtml` / `contentHtmlNl` may be given instead of markdown. Validation (enforced unless `--allow-short`): body ≥ 700 words, at least one H2, ≥ 2 internal links, SEO title ≤ 60 chars, SEO description ≤ 160 chars, Dutch title and body present. Authors: `levi-bouman`, `bodrik-bakker`.

### Framer template changes (branch `blog-pipeline`)

`framer-setup.mjs` added, on a branch for review:

1. Blog collection field **Updated** (date), pre-filled with each post's `Date`.
2. Code components `MarkdownLink.tsx` (sidebar link "Read as Markdown" / "Lees als Markdown" → `content.trackbase.ai/.../<slug>.md`) and `UpdatedLabel.tsx` (shows "Updated <date>" next to the publication date only when the post was updated after publication).
3. `ArticleSchema.tsx` now emits `dateModified` (bound to Updated; falls back to `datePublished`).
4. Blog detail page: `Dates` frame in the top bar (date + UpdatedLabel), MarkdownLink under "Summarize this article with".

## Routine

`ROUTINE.md` is the self-contained prompt for the scheduled content run (3×/week). It reads the cited-sources data through the Trackbase MCP connector attached to the cloud routine (HTTP fallback with `TRACKBASE_MCP_TOKEN`), picks a topic, writes the article, runs the scripts above, exports the markdown, commits to this repo and publishes.
