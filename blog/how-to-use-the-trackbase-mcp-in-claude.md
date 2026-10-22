---
title: "How to Use the Trackbase MCP in Claude: 12 Workflows With Prompts to Copy"
description: "Connect Trackbase to Claude with MCP and ask your AI visibility data anything. 12 practical workflows, from competitor gaps to cited sources, with prompts."
canonical: https://trackbase.ai/blog/how-to-use-the-trackbase-mcp-in-claude
markdown: https://content.trackbase.ai/blog/how-to-use-the-trackbase-mcp-in-claude.md
language: en
alternate_language: nl-NL
alternate: https://trackbase.ai/nl/blog/how-to-use-the-trackbase-mcp-in-claude
alternate_markdown: https://content.trackbase.ai/nl/blog/how-to-use-the-trackbase-mcp-in-claude.md
date_published: 2026-09-28
author: "Levi Bouman"
author_url: https://trackbase.ai/blog/author/levi-bouman
publisher: Trackbase
publisher_url: https://trackbase.ai
category: "AI Visibility"
image: https://framerusercontent.com/images/o4q5dO5uE71ZZhgQk38lGPD0kA.png
word_count: 1716
reading_time_minutes: 8
---

# How to Use the Trackbase MCP in Claude: 12 Workflows With Prompts to Copy

> Connect Trackbase to Claude with MCP and ask your AI visibility data anything. 12 practical workflows, from competitor gaps to cited sources, with prompts.

*By Levi Bouman · Published 2026-09-28 · Original article: https://trackbase.ai/blog/how-to-use-the-trackbase-mcp-in-claude*

The platform answers the questions you already knew to ask. The harder questions come later: why a competitor wins a prompt you expected to own, which sources ChatGPT trusts in your category, or whether a price change has reached AI answers yet. With the Trackbase MCP server you can ask those questions in plain language, in Claude or any other MCP client, and get the answer straight from your own tracking data.

**The Trackbase MCP connects your AI visibility data to Claude, Codex and other MCP-compatible clients. It offers 13 read-only tools for visibility, competitors, AI answers, cited sources, crawler and visitor analytics and ChatGPT Shopping. It is available as an add-on on Professional and included in Enterprise / Agency. Readers of this article get free access to the add-on: contact us and mention this article.**

## What is the Trackbase MCP?

MCP stands for [Model Context Protocol](https://trackbase.ai/glossary/model-context-protocol), an open standard that lets AI assistants call tools and read data from other software. Trackbase runs a remote MCP server. Once it is connected, Claude looks up your metrics itself, combines several data sets in one answer and turns the result into a table, a summary or a plan.

Every tool is read-only and scoped to your organization. Claude can read your data, but it cannot change your prompts, competitors or settings.

## What Claude can read through the Trackbase MCP

|
Data

 |

What Claude gets

 |
| --- | --- |
|

Visibility overview

 |

Visibility Score, share of voice, mentions, citations, presence rate and average position, per day and per AI model, with the change against the previous period

 |
|

Competitor intelligence

 |

Competitor rankings, share of voice, competitive gap and head-to-head wins and losses

 |
|

Prompt responses and mentions

 |

The full AI answers to your tracked prompts, whether your brand was mentioned, its position, the sentiment and the sources cited

 |
|

Sources intelligence

 |

The URLs and domains AI models cite, per prompt and per model, including the prompts that cite your own pages

 |
|

Crawler and visitor analytics

 |

AI crawler visits to your site and visits that come from AI assistants, once both are connected

 |
|

ChatGPT Shopping

 |

Carousel positions, price positioning, merchant share, product history and price or tag alerts, when Shopping tracking is enabled

 |

All data tools accept a time window of up to 365 days. The visibility, competitor, answer and source tools can also be filtered by AI model.

## 12 workflows to try in Claude

Each workflow comes with a prompt you can paste into Claude as it is. Start with "Use the Trackbase MCP" so Claude knows where to look, and replace the parts in brackets with your own details.

### 1\. Start the week with a visibility snapshot

The quickest way in. Claude reads your [Visibility Score](https://trackbase.ai/glossary/ai-visibility-score), share of voice, mentions and citations, and explains what moved compared with the previous period.

**Prompt to copy:** *"Use the Trackbase MCP and give me a snapshot of our AI visibility over the last 7 days: Visibility Score, share of voice, mentions, citations and sentiment. What changed compared with the week before?"*

### 2\. Find the AI model where you are weakest

Your visibility rarely looks the same in every assistant. Let Claude compare the models side by side, so you know whether to focus on ChatGPT, Gemini, Perplexity or Google AI Overviews.

**Prompt to copy:** *"Use the Trackbase MCP and compare our visibility and sentiment per AI model over the last 30 days. In which model are we weakest, and which prompts cause that?"*

### 3\. Benchmark your share of voice against competitors

Claude puts your [share of voice](https://trackbase.ai/glossary/ai-share-of-voice) next to your competitors' and uses the head-to-head data to show who wins when you both appear in the same answer. Our guide to [comparing AI visibility against competitors](https://trackbase.ai/blog/how-do-i-compare-ai-visibility-against-competitors) explains how to read those numbers.

**Prompt to copy:** *"Use the Trackbase MCP and compare our share of voice with our three biggest competitors over the last 30 days. Where are we ahead, where are we losing ground, and which competitor beats us most often head-to-head?"*

### 4\. Read the answers where you are missing

The numbers tell you that you are absent. The answers tell you why. For every tracked prompt, Trackbase stores the full AI response, whether your brand was mentioned and which competitors were named instead.

**Prompt to copy:** *"Use the Trackbase MCP and list the prompts where we were not mentioned in the last 14 days. Which brands were named instead, and what do those answers have in common?"*

### 5\. Audit the sources behind AI answers

AI models build their answers on [cited sources](https://trackbase.ai/glossary/cited-sources). Claude can rank the domains and pages that get cited most for your prompts and show which of them mention your competitors. Our article on [getting cited by AI](https://trackbase.ai/blog/how-to-get-cited-by-ai-earning-mentions-on-the-sources-models-trust) explains what to do with that list.

**Prompt to copy:** *"Use the Trackbase MCP and show the 10 domains AI models cited most for our prompts in the last 30 days. Which of them mention our competitors but not us, and which are realistic targets for outreach or content?"*

### 6\. See which prompts cite your own pages

Now turn it around. Start from your own domain or a single URL and ask which prompts and models cite it. You quickly see which pages already work in AI search and which never get picked up.

**Prompt to copy:** *"Use the Trackbase MCP and tell me which prompts cited pages on \[yourdomain.com\] in the last 30 days, per AI model. Which of our pages are cited most, and for which of our prompts are we never cited?"*

### 7\. Check sentiment after a launch or price change

AI answers do not update the moment your pricing or positioning changes. Filter your mentions on sentiment and let Claude read how assistants describe you right now. Why that matters is covered in [why sentiment decides who wins](https://trackbase.ai/blog/being-mentioned-by-ai-isnt-enough-why-sentiment-decides-who-wins).

**Prompt to copy:** *"Use the Trackbase MCP and read our brand mentions from the last 14 days. How do AI models describe our pricing and positioning? Flag anything that is outdated, incorrect or negative."*

### 8\. Turn visibility gaps into a content plan

Combine the previous workflows and ask Claude for a plan. Paste your sitemap or a list of your key URLs into the conversation, so Claude can check which gaps you already have a page for and which need new content. This is [AI content gap analysis](https://trackbase.ai/glossary/ai-content-gap-analysis) without the spreadsheet work.

**Prompt to copy:** *"Use the Trackbase MCP to find the prompts where competitors are mentioned and we are not. Compare those topics with the pages in our sitemap and suggest the 5 pages we should create or improve first, each with a short brief."*

### 9\. Combine AI visibility with your other data

Claude can use several connectors in one conversation. Put Trackbase next to Google Search Console, GA4 or your CRM and ask how AI visibility relates to search performance and conversions. Trackbase also measures [AI referral traffic](https://trackbase.ai/glossary/ai-referral-traffic) itself once visitor tracking is set up: visits that come from AI assistants, which most analytics tools lump together, as we explain in [why you can't measure AI search in Google Analytics](https://trackbase.ai/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead).

**Prompt to copy:** *"Use the Trackbase MCP and our Search Console connector. Take our 10 most-cited pages in AI answers and compare them with their clicks and impressions in Search Console. Where is AI visibility strong but search traffic weak, and the other way around?"*

### 10\. Find pages AI crawlers read but never cite

With [crawler analytics](https://trackbase.ai/features/crawler-analytics) connected through Cloudflare, Trackbase sees which pages GPTBot, ClaudeBot, PerplexityBot and other AI crawlers visit. Put that next to your citations and you know which pages AI models read but do not use.

**Prompt to copy:** *"Use the Trackbase MCP and list the pages GPTBot crawled this month. Which of them were never cited in AI answers, and what could we improve on those pages?"*

### 11\. Monitor your products in ChatGPT Shopping

For e-commerce brands with [ChatGPT Shopping](https://trackbase.ai/features/chatgpt-shopping) tracking, Claude can read your [product carousel](https://trackbase.ai/glossary/product-carousel) positions, price positioning and merchant share, plus every price and tag change Trackbase picked up.

**Prompt to copy:** *"Use the Trackbase MCP and show which of our products lost position in ChatGPT Shopping carousels this week. Did a price change or a tag change come before the drop?"*

### 12\. Automate a weekly report with Claude Code or Codex

You do not have to ask the same questions every Monday. With a personal API token, Claude Code, Codex or your own agent can run a fixed set of questions on a schedule and write the answers into a report. Agencies can use the same setup for [client reporting](https://trackbase.ai/glossary/white-label-reporting), as described in [AI visibility for agencies](https://trackbase.ai/blog/ai-visibility-for-agencies-how-to-offer-geo-tracking-as-a-service).

**Prompt to copy:** *"Use the Trackbase MCP and update weekly-report.md: add this week's Visibility Score, share of voice, top 5 cited domains and new competitor mentions, and highlight everything that changed by more than 10% since last week."*

## Tips for better answers

-   **Name the time window.** "Last 7 days" or "last 90 days" gives Claude a clear scope. The tools go back up to 365 days.

-   **Name the AI model.** Ask about ChatGPT, Gemini or Google AI Overviews separately when the difference matters.

-   **Ask for the evidence.** Let Claude quote the answers and sources behind a conclusion, so you can check them.

-   **Ask for a format.** A table, a short summary or a content brief is easier to share than a long reply.

## How to connect the Trackbase MCP

1.  Check your plan. The MCP connection is an add-on on Professional and included in Enterprise / Agency. Found us through this article? Contact us and you get the add-on for free.

2.  In Claude, add a custom connector with the server URL **https://app.trackbase.ai/api/mcp** and sign in with your Trackbase account (OAuth).

3.  For Claude Code, Codex or any other MCP client, use the same URL with a personal API token. Tokens are shown once, stored hashed and can be revoked at any time.

Everything about the server is on the [MCP feature page](https://trackbase.ai/features/mcp).

## Get the MCP add-on for free

The best first question is the one the platform cannot answer yet. [Contact us](https://trackbase.ai/contact) and mention this article: you get free access to the MCP add-on, and we help you connect it. Prefer to see it first? [Book a demo](https://trackbase.ai/contact#book-demo) with your own data, or compare the plans on our [pricing page](https://trackbase.ai/pricing).

---

**About Trackbase.** Trackbase is a Dutch AI visibility platform that measures every day how ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews and other AI models talk about your brand, and turns that into a Visibility Score, Share of Voice and prioritized actions. More at https://trackbase.ai · Glossary: https://trackbase.ai/glossary · This article in Dutch: https://trackbase.ai/nl/blog/how-to-use-the-trackbase-mcp-in-claude
