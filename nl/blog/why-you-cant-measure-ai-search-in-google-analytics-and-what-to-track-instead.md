---
title: "Waarom je AI-search niet kunt meten in Google Analytics (en wat je wél moet tracken)"
description: "In GA4 lijkt een bezoek na een AI-aanbeveling op direct verkeer of een merkzoekopdracht. Waarom AI-search onzichtbaar blijft en wat je wél moet meten."
canonical: https://trackbase.ai/nl/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead
markdown: https://content.trackbase.ai/nl/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead.md
language: nl-NL
alternate_language: en
alternate: https://trackbase.ai/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead
alternate_markdown: https://content.trackbase.ai/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead.md
date_published: 2026-06-23
date_modified: 2026-11-06
author: "Levi Bouman"
author_url: https://trackbase.ai/blog/author/levi-bouman
publisher: Trackbase
publisher_url: https://trackbase.ai
category: "AI Visibility"
image: https://framerusercontent.com/images/YwLFrBEFNTCCWxFzWDqfWToCQHs.webp
word_count: 1014
reading_time_minutes: 5
---

# Waarom je AI-search niet kunt meten in Google Analytics (en wat je wél moet tracken)

> In GA4 lijkt een bezoek na een AI-aanbeveling op direct verkeer of een merkzoekopdracht. Waarom AI-search onzichtbaar blijft en wat je wél moet meten.

*Door Levi Bouman · Gepubliceerd 2026-06-23 · Bijgewerkt 2026-11-06 · Oorspronkelijk artikel: https://trackbase.ai/nl/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead*

Een koper vraagt ChatGPT naar de beste tool in jouw categorie en krijgt een shortlist van drie merken. De koper kiest er één, belandt op de site en converteert een week later. In GA4 zie je die sessie terug als direct verkeer of een branded search. Het moment dat de doorslag gaf, de AI die jouw merk op de shortlist zet, vind je nergens terug in je rapportages.

**Kort antwoord: je kunt AI-search niet alleen met Google Analytics meten, omdat de invloed binnen het antwoord ontstaat, vóór elke klik. Gebruik GA4 voor de kliks die wel binnenkomen en een aparte AI-zichtbaarheidstool om je aanwezigheid in de antwoorden te meten.**

## Het meetprobleem is structureel

Traditionele analytics leunt op de klik: zoekopdracht, resultaat, klik, sessie. AI search breekt die keten op twee plekken.

-   De meeste [AI-antwoorden](https://trackbase.ai/nl/blog/monitor-changes-in-ai-answers-over-time) zijn **zero-click**. Het model beantwoordt de vraag direct in de chat, waardoor de gebruiker krijgt wat hij zoekt zonder jouw site te bezoeken.

-   Als er al wordt geklikt, is de referral-data vaak generiek of gestript. Je weet dus niet of [ChatGPT](https://trackbase.ai/nl/blog/track-what-chatgpt-says-about-your-company) of Perplexity de bezoeker stuurde.

De fase waarin de koper zijn shortlist maakt, bereikt je funnel dus nooit. Je ziet het bezoek ná de aanbeveling, maar de aanbeveling zelf blijft onzichtbaar.

## Wat GA4 wel en niet ziet

| Signaal | Zichtbaar in GA4? | Waarom |
| --- | --- | --- |
| Klik op een geciteerde link met duidelijke referrer | Deels | Verschijnt als referral als de referrer behouden blijft |
| Klik met gestripte referrer | Nee | Komt terecht in direct verkeer |
| Merk gezien in antwoord, later zelf ingetypt | Nee | Lijkt op direct of branded search |
| Genoemd worden zonder link | Nee | Er ontstaat helemaal geen sessie |
| Welke concurrenten de AI noemde | Nee | Gebeurt buiten je site |
| Welke bronnen de AI gebruikte | Nee | Vraagt data op antwoordniveau |

Ook waar meten wel lukt, is het volume klein en de waarde hoog. Onderzoek van HubSpot, samengevat in [het overzicht van AI-zichtbaarheidstools](https://blog.hubspot.com/marketing/best-ai-visibility-tools), meldt dat via AI aangebrachte ecommerce-bezoekers wereldwijd converteren met 11,4% tegenover 5,3% voor organische zoekopdrachten, en Ahrefs zag AI-bezoekers 23 keer beter converteren dan traditioneel organisch verkeer, vanuit een kleine basis. Klein en waardevol is precies het profiel dat je mist als je alleen naar totalen kijkt.

## Waarom dit gevaarlijk is, en niet alleen irritant

Je kunt maandenlang terrein verliezen in AI-antwoorden terwijl je dashboards er prima uitzien. De klap komt pas later, wanneer je pipeline opdroogt en niemand weet waarom. De oorzaak is dan al weken oud en onzichtbaar.

Er is nog een nadeel. Je optimaliseert wat je meet. Als je AI-zichtbaarheid niet meet, stuur je er ook niet op. [Concurrenten](https://trackbase.ai/nl/blog/how-do-i-compare-ai-visibility-against-competitors) die dit wel volgen, bouwen geruisloos een voorsprong op. Het is hetzelfde gat dat early adopters in de begindagen van SEO sloegen. Goed om te begrijpen [wat AI-zichtbaarheid nu echt is](https://trackbase.ai/nl/blog/what-is-ai-visibility-and-why-it-matters) voor die kloof groter wordt.

## Wat je in plaats daarvan meet

Tel niet alleen de klikken ná het antwoord, maar meet je aanwezigheid ín het antwoord. Vier signalen doen het werk:

-   **Visibility Score**: hoe vaak en hoe prominent je verschijnt bij de [prompts](https://trackbase.ai/nl/features/prompt-tracking) die jouw kopers invoeren.

-   **Share of Voice**: hoe jouw vermeldingen zich verhouden tot die van concurrenten in dezelfde antwoorden.

-   **Sentiment**: beschrijft het model je positief, neutraal of met twijfel?

-   **Vermeldingen versus citaties**: word je alleen genoemd, of echt als bron gebruikt? Dat [verschil is cruciaal](https://trackbase.ai/nl/blog/mentions-vs-citations-why-both-matter-for-your-ai-visibility).

Dit wil je **per platform** zien. Elk model gebruikt andere bronnen en antwoordt anders. Goed scoren in ChatGPT zegt weinig over Perplexity of Gemini. Er zijn [11 platforms die er in 2026 toe doen](https://trackbase.ai/nl/blog/the-11-ai-platforms-every-brand-should-be-tracking-in-2026).

## Zo richt je de GA4-kant in

GA4 blijft nuttig voor het deel van het plaatje dat je wel kunt zien.

1.  **Maak een aangepaste kanaalgroep** "AI-assistenten" met een bronregel voor de referrers die je in de praktijk ziet, zoals chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com en claude.ai. Check eerst je eigen verwijzingsrapport: de exacte domeinen veranderen.

2.  **Voeg een segment of verkenning toe** voor dat kanaal en vergelijk sessies, betrokkenheid en conversies met organisch zoeken.

3.  **Volg branded search en direct verkeer** als vertraagde indicator. Een gestage stijging van beide zonder campagne is vaak AI-invloed die later zichtbaar wordt.

4.  **Voeg een veld "Hoe heb je ons gevonden?"** toe aan demo- en aanmeldformulieren, met AI-assistenten als optie. Zelfgerapporteerde herkomst vult een deel van het gat dat referrers laten.

## Zo richt je de antwoordkant in

-   Bepaal de belangrijkste prompts: categorievragen, vergelijkende vragen en variaties op "beste tool voor \[use case\]".

-   Draai ze met een vaste regelmaat op de grote AI-platforms, dus niet als eenmalige steekproef.

-   Volg de verschuivingen in de tijd, want modellen verversen en antwoorden veranderen per week.

-   Bekijk de geciteerde bronnen, zodat je weet op welke pagina's modellen echt leunen.

Dit elke dag handmatig doen op alle platforms is niet realistisch. Daarom voert [Trackbase](https://trackbase.ai/nl/blog/inside-the-trackbase-dashboard-track-analyze-act-in-one-view) de prompts elke 24 uur voor je uit en vertaalt de antwoorden in [metrics](https://trackbase.ai/nl/blog/geo-metrics-that-matter) waar je mee aan de slag kunt. Wil je eerst een eerste indruk, probeer dan de [gratis AI-zichtbaarheidscheck](https://trackbase.ai/free-ai-visibility-checker); de plannen staan op de [prijspagina](https://trackbase.ai/pricing). Voor de praktische GA4-aanpak, lees [hoe AI-zichtbaarheidstools passen in SEO-workflows en GA4](https://trackbase.ai/nl/blog/how-ai-visibility-tools-fit-seo-workflows-ga4).

## FAQ

### Kan GA4 verkeer van ChatGPT meten?

Deels. Als een gebruiker op een link in een antwoord klikt en de referrer wordt doorgegeven, toont GA4 dit als referral-verkeer. Veel bezoeken komen zonder bruikbare referrer binnen en tellen als direct, dus GA4 onderschat de echte invloed altijd.

### Waarom stijgt mijn directe verkeer?

Er zijn veel mogelijke oorzaken, en AI-aanbevelingen zijn er één van. Wie je merk in een antwoord ziet, typt vaak later je naam of domein in. Combineer trends in direct en branded search met zichtbaarheidsdata op antwoordniveau om te zien of de timing klopt.

### Wat is de minimale opzet om AI-search te meten?

Een aangepaste GA4-kanaalgroep voor bekende AI-referrers, een veld voor zelfgerapporteerde herkomst op formulieren en een vaste set prompts over de belangrijkste AI-modellen met Visibility Score en geciteerde bronnen. Daarmee dek je zowel de kliks die je ziet als de antwoorden die je niet ziet.

## Klaar om te winnen in AI search?

Sluit je aan bij de merken die hun zichtbaarheid al meten op ChatGPT, Gemini, Claude en meer. [Start vandaag nog je gratis proefperiode](https://app.trackbase.ai/nl/register).

---

**Over Trackbase.** Trackbase is een Nederlands AI-zichtbaarheidsplatform dat dagelijks meet hoe ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews en andere AI-modellen over je merk praten, en dat vertaalt naar een Visibility Score, Share of Voice en concrete acties. Meer op https://trackbase.ai/nl · Begrippenlijst: https://trackbase.ai/nl/glossary · Dit artikel in het Engels: https://trackbase.ai/blog/why-you-cant-measure-ai-search-in-google-analytics-and-what-to-track-instead
