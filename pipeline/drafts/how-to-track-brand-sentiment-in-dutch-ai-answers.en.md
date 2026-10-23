To track the sentiment of AI mentions in Dutch-language answers, run a fixed set of Dutch prompts every day across several AI models, classify each brand mention as positive, neutral or negative, and report one number: the Net Sentiment Score (positive mentions minus negative mentions, divided by total mentions, times 100). Do not rely on English prompts or on social listening tools. They measure a different audience and a different signal than what a Dutch buyer sees when they ask ChatGPT, Gemini or Perplexity a question in their own language.

This guide shows how to set that up, which numbers to trust, and what to do when the tone is lukewarm.

## Why Dutch answers need their own sentiment tracking

AI models do not give the same answer in every language. A Dutch question triggers Dutch searches, surfaces Dutch sources (review sites, forums, news outlets, comparison pages) and often produces a different shortlist of brands than the same question in English. The tone follows the sources: a brand that is well covered in English trade press but barely reviewed on Dutch sites can sound hesitant in Dutch.

Two things make this a measurement problem, not a translation problem:

- **Different sources.** The pages a model cites for a Dutch prompt are often not the pages it cites for the English twin.
- **Different hedging language.** Dutch answers signal doubt with phrases such as "kan geschikt zijn voor" or "sommige gebruikers vinden". A sentiment classifier that was only tested on English can mislabel these as neutral.

AI sentiment also differs from social listening. Tools such as Brandwatch monitor what people say; AI sentiment monitors what the model itself says when it answers. Both matter, but they need separate tracking and separate owners. Visiblie, a competitor in this space, puts the same distinction well: a brand with happy customers on social media can still have a content and entity problem in AI answers.

## Step 1: Build a Dutch prompt set

Start with 20 to 30 prompts written the way a Dutch buyer types them, not translated from your English set. Mix four types:

| Prompt type | Dutch example | What it reveals |
| --- | --- | --- |
| Category | "Wat is de beste tool om AI-zichtbaarheid te meten?" | Whether you are named at all |
| Evaluation | "Is [merk] goed voor een MKB-bedrijf?" | Direct perception of your brand |
| Comparison | "[merk] versus [concurrent]: wat is beter?" | How you are framed against rivals |
| Stress test | "Welke [categorie]-tools kun je beter vermijden en waarom?" | Hidden negatives |

Stress-test prompts are worth the effort. OtterlyAI recommends adding "best" and "worst" prompts for each category because they force a model to spell out the attributes it associates with each brand. If you appear in a "vermijden" answer, you know exactly which narrative to fix.

Add Dutch prompts to your tracked set in [Prompt Tracking](https://trackbase.ai/features/prompt-tracking) the same way you add English ones. Keep wording stable: if you rephrase a prompt, you reset the trend line.

## Step 2: Run across models, every day

One-off tests are noise. Answers change from run to run and between models, so you need volume and repetition. In Trackbase's own last-7-days data, citation sentiment averaged 68 out of 100 across 51 scored citations (35 positive, 13 neutral, 3 negative), yet per-model sentiment ranged from 56 on Grok to 75 on Google AI Mode. A single model would have given you a misleading picture in either direction.

Track at least ChatGPT, Gemini, Perplexity, Claude and the two Google surfaces (AI Overview and AI Mode). Trackbase runs prompts daily across 11 models, so the sentiment trend is built from many answers rather than one lucky screenshot.

## Step 3: Score it with a Net Sentiment Score

Classify each mention, then calculate:

**NSS = (positive mentions − negative mentions) ÷ total mentions × 100**

The score runs from −100 to +100. OtterlyAI uses this exact formula in its dashboard, while Visiblie's variant also counts hallucinations as negatives and treats "cautious" mentions as zero. Whichever variant you pick, keep it fixed. Always report the volume next to the score: an NSS of +60 on 10 mentions says far less than +60 on 500.

Also track the spread, not just the net:

- **Positive:** the model recommends you ("een goede keuze voor", "veel gebruikt door").
- **Neutral:** you are listed without positioning.
- **Cautious:** hedged language ("kan geschikt zijn", "beperkt").
- **Negative:** the model warns against you or states a clear weakness.
- **Wrong:** facts that are simply incorrect, such as old pricing. See [how to fix what AI gets wrong about your brand](https://trackbase.ai/blog/fix-what-ai-gets-wrong-about-your-brand).

Trackbase reports sentiment per model next to your Visibility Score and Share of Voice; see [how the Visibility Score is calculated](https://trackbase.ai/blog/how-trackbase-calculates-your-visibility-score-and-why-its-different).

## Step 4: Find the drivers behind the tone

A sentiment number is only useful if it points to a fix. For every negative or cautious answer, open the response and note two things: which attribute drove the tone (price, support, features, trust, market position), and which sources the model cited. Then act on the source, not the symptom.

OtterlyAI reports that 95% of AI citations come from third-party sources. In practice that means a Dutch review on a respected comparison site or trade publication will usually move the tone faster than rewriting your own homepage. Typical fixes:

1. Earn coverage on the Dutch sites the model already cites for that prompt (digital PR).
2. Publish a Dutch comparison or case study page that answers the exact weakness.
3. Make facts consistent across your website, directories and profiles so the model has no gaps to fill.
4. Re-run and watch the trend for two to four weeks.

For the thinking behind this, read [why sentiment decides who wins](https://trackbase.ai/blog/being-mentioned-by-ai-isnt-enough-why-sentiment-decides-who-wins).

## How to start this week

If you have no baseline yet, run the [free AI visibility checker](https://trackbase.ai/free-ai-visibility-checker) to see whether and how AI models mention you today. Then set up the Dutch prompt set in a 7-day free trial; the [PR and brand teams solution](https://trackbase.ai/solutions/pr-brand-teams) page shows the sentiment and narrative workflow, and [pricing](https://trackbase.ai/pricing) lists the current plans. The glossary entry on [AI brand sentiment](https://trackbase.ai/glossary/ai-brand-sentiment) covers the definitions.

## FAQ

### Can I use my English prompts for Dutch sentiment?

No. Models search and cite differently per language, so a Dutch buyer can see a different shortlist and a different tone than the English twin of the same question. Write the Dutch prompts natively and track them as a separate set.

### What is a good Net Sentiment Score?

It depends on your category. As a rough guide from Visiblie's published scale, above +60 is strong and between −19 and +19 means mixed perception. The most useful benchmark is your score relative to your direct competitors on the same prompts.

### How often should I check AI sentiment?

Daily collection with a weekly review is the practical setup, because individual answers vary. Treat a drop of around 10 points between periods as a signal to investigate, a threshold Visiblie also suggests for alerts.
