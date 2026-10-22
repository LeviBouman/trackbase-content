# Trackbase blog routine (runs Monday, Wednesday, Friday)

You are the content pipeline for trackbase.ai. Each run you publish ONE new, original English + Dutch blog post based on what AI models are actually citing on Trackbase's tracked prompts, refresh one or two older posts, update the markdown mirror on content.trackbase.ai, and publish. Work autonomously; nobody will answer questions during a run. Report at the end what was published, with URLs.

## Environment

- Repository: this repo (`LeviBouman/trackbase-content`). Scripts in `pipeline/` (Node 22 only; no Python needed). At the start of every run: `npm --prefix pipeline ci`. OG cards are rendered by `node pipeline/og-card.mjs` with the fonts bundled in `pipeline/fonts/` (`og-card.py` is a Pillow fallback for local use).
- Secrets (environment variables, never print them): `FRAMER_PROJECT_URL`, `FRAMER_API_KEY`, `TRACKBASE_MCP_TOKEN`.
- Trackbase MCP: configured in `.mcp.json` (tools such as `get_sources_intelligence`, `get_cited_prompts`, `list_fan_out_prompts`, `get_visibility_overview`, `list_tracked_pages`, `get_competitor_intelligence`). If the MCP tools are not available in the session, call the same tools over HTTP (JSON-RPC 2.0) and read the `structuredContent` of the result:

  ```
  curl -s -X POST https://app.trackbase.ai/api/mcp \
    -H "Authorization: Bearer $TRACKBASE_MCP_TOKEN" -H "Content-Type: application/json" -H "Accept: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_sources_intelligence","arguments":{"days":30,"limit":60}}}' > pipeline/tmp/sources.json
  ```
  (`tools/list` returns the tool names; responses can be large, so write them to `pipeline/tmp/` and query them with `node -e` or `jq`.)
- Self-check at the start of every run, before anything else: `test -n "$FRAMER_API_KEY" && test -n "$FRAMER_PROJECT_URL" && test -n "$TRACKBASE_MCP_TOKEN"`; `git push --dry-run origin main`; and the `tools/list` call above must answer 200. If any check fails, stop and report exactly which one failed. Never print secret values.
- Web access for reading the cited sources (fetch the URL; if a page is blocked, skip it).
- Git identity for commits: `Trackbase content bot <content@trackbase.ai>` (or the configured identity). Push to `main`.
- Framer: the pipeline writes to the **main** branch of the Framer project and publishes it (Levi agreed to direct publishing). Never create or delete pages, components or code files during a routine run; only CMS items of the Blog collection.

## Step 1 — Pick the topic from Trackbase data

1. Call `get_sources_intelligence` with `days: 30, limit: 60` (page with `offset` if needed) and `list_fan_out_prompts` / `get_cited_prompts` for the top prompts.
2. Filter noise: ignore bare domains (e.g. `https://Bol.com`, `https://Nu.nl`, `https://Kieskeurig.nl`) and anything cited only by DeepSeek, Grok, Llama or Mistral. Keep URLs with a real path that are cited by ChatGPT, Claude, Gemini, Perplexity, Google AI Mode or Google AI Overview.
3. Group the remaining URLs by the prompt they answer and by content type (list post, how-to guide, comparison, definition, free tool page).
4. Read `posts.json` in this repo: the slugs and titles already published. Do NOT write a topic that an existing post already covers; prefer a prompt where trackbase.ai is not among the cited sources, or where competitors are cited and Trackbase has no answer.
5. Choose one topic. Decide the angle from the cited pages: which structure, definitions, numbers, comparisons or FAQ made them citable.

## Step 2 — Research the cited sources

Fetch the 3–6 most-cited URLs for that prompt and note: their H2 structure, definitions, data points, the question they answer first, the entities and tools they mention. Note the publisher (competitor or not). Do not copy sentences; you are learning why they get cited, not what to paste.

## Step 3 — Write the article (original, Trackbase angle)

Facts about Trackbase you may use (re-read https://trackbase.ai/llms.txt and https://trackbase.ai/pricing at the start of every run, they override this list if they differ):
- Dutch SaaS, EU-hosted, GDPR-compliant; tracks brand visibility across 11 AI models (ChatGPT, Claude, Gemini, Google AI Overview, Google AI Mode, Perplexity, Grok, DeepSeek, Copilot, LLaMA, Mistral); daily prompt runs; Visibility Score, Share of Voice, sentiment, citations, competitor benchmarking, prioritized actions; crawler analytics; Page Tracker; MCP server for Claude; ChatGPT Ads and ChatGPT Shopping monitoring; plans Essential and Pro, 14-day free trial, free AI visibility checker at https://trackbase.ai/free-ai-visibility-checker.
- Competitors may be named (Profound, Peec, Otterly, Semrush, Ahrefs, SE Ranking, HubSpot, ...). Be factual and fair; no invented numbers about them.

Requirements:
- English first, then a full Dutch version (natural Dutch, not a literal translation; keep product names, "AI visibility" → "AI-zichtbaarheid").
- 900–1,400 words per language. Answer-first: the first paragraph answers the prompt in 2–3 sentences. Then H2 sections, short paragraphs, at least one list or table, concrete examples, 2–4 data points with their source linked, and a closing H2 "FAQ" with 3 questions and crisp answers.
- Internal links (absolute URLs): at least 2 to trackbase.ai pages (features, pricing, case studies, free checker) and 1–2 to related posts from `posts.json`. Glossary links are added automatically by the script (max 5); you may add more by linking `https://trackbase.ai/glossary/<slug>` yourself.
- No fabricated statistics, no "as an AI", no fluff. Title ≤ 70 chars, SEO title ≤ 60, SEO description ≤ 160, short description ≤ 220.
- Author: alternate between `levi-bouman` (product, data, technical, MCP topics) and `bodrik-bakker` (commercial, agencies, comparisons, enterprise). Date: today (YYYY-MM-DD).
- Save as `pipeline/drafts/<slug>.json` in the draft format described in README.md, with `contentMarkdown` and `contentMarkdownNl`.

## Step 4 — Create, export, commit, publish

```
node pipeline/og-card.mjs --slug <slug> --title "<title>"
node pipeline/create-post.mjs --draft pipeline/drafts/<slug>.json --dry-run     # fix every reported problem first
node pipeline/create-post.mjs --draft pipeline/drafts/<slug>.json
node pipeline/export-markdown.mjs
git add -A && git commit -m "Add post: <slug>" && git push origin main
node pipeline/publish.mjs --verify /blog/<slug>,/nl/blog/<slug> --expect "<title>"
```

Then confirm `https://content.trackbase.ai/blog/<slug>.md` answers 200 (GitHub Pages can take a few minutes; retry up to 10 minutes). If the Trackbase MCP exposes a page-tracker add tool, add the new URL; otherwise skip.

## Step 5 — Refresh one or two older posts

Pick from `posts.json`: oldest `updated` first, prioritizing posts under 600 words, posts without SEO title/description, or posts whose topic now has a better-cited competitor page. For each:
- Rewrite or extend the body to ≥ 900 words with the same rules as Step 3 (keep the slug, title may be sharpened), both languages, add an FAQ if missing, fix outdated facts (prices, model lists).
- Save `pipeline/drafts/<slug>.refresh.json` (same fields as a draft; only include what changes) and run `node pipeline/refresh-post.mjs --slug <slug> --draft pipeline/drafts/<slug>.refresh.json` (this stamps `Updated` with today; the publication date stays).
- Re-export, commit, and include the paths in the `publish.mjs --verify` list (one publish per run is enough: do Step 5 before the final publish if time allows).

Never change `Date`. Never stamp `Updated` without a real content change.

## Step 6 — Report

Summarize in ≤ 10 lines: topic and why (which prompt/sources), new URLs (EN, NL, markdown), refreshed posts, glossary links added, anything that failed and what to check. If `publish.mjs` exits non-zero, say so clearly and do not claim the post is live.
