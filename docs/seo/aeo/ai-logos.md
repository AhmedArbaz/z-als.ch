# "Ask AI about Z-ALS": logos, brand rules and links (researched 2026-10-20)

The footer column (`tools/seo/ask-ai.mjs`, every page) opens four AI assistants with a question about Z-ALS in the
page's language. It never says the assistants recommend Z-ALS: that would be a false claim today (Ubersuggest AI
visibility 0%, `baseline-2026-10-20.json`), against each brand's rules, and a Swiss UWG risk.

## Decisions (agreed with the user)

| Assistant | Shown as | Link | Why |
|---|---|---|---|
| ChatGPT | OpenAI Blossom, monochrome, 16px | `https://chatgpt.com/?q=` | OpenAI's usage terms permit the logo where it "directly relates to OpenAI services", used "exactly as provided", not more prominent than our own marks, no implied endorsement. Prefill works even logged out (submits at once). |
| Claude | Claude mark, monochrome, 16px | `https://claude.ai/new?q=` | Anthropic offers a press kit (newsroom → Media assets) but publishes no third-party rules; nothing forbids a plain, unaltered link mark. Prefill works when signed in; logged-out visitors pass through sign-in and **lose the question** (`returnTo=/new?`). |
| Gemini | **Name only** + a neutral speech-bubble glyph, subtitle "Google AI Mode" | `https://www.google.com/search?udm=50&q=` | Google: product icons need permission ("refer to our icon usage guidelines"); plain-text references are allowed. The Gemini app ignores `?q=` (empty chat); Google AI Mode runs on Gemini and answers without sign-in. |
| Perplexity | Perplexity mark, monochrome, 16px | `https://www.perplexity.ai/search?q=` | No official public guidelines found; trademark respected by using the mark unaltered. Prefill works; logged-out visitors are asked to sign up to see the answer. |
| Microsoft Copilot | **Dropped** | — | Microsoft: logos and icons "can never be used without an express license"; `copilot.microsoft.com/?q=` redirects to a sign-in page and drops the question. |

Marks: `tools/seo/ai-icons/*.svg` from [simple-icons](https://simpleicons.org) (CC0 paths of the official marks):
`claude.svg` and `perplexity.svg` from 16.35.0, `openai.svg` from 15.9.0 (later releases dropped it). They render in
`currentColor` (white on the dark footer): no added colours, no effects, as OpenAI's Blossom rules require.

If a brand objects or publishes stricter rules, replace its `svg` in `tools/seo/ask-ai.mjs` with the neutral glyph
(as Gemini) and rebuild. Permission contacts: OpenAI partnercomms@openai.com, Anthropic press@anthropic.com.

## What the assistants already say (spot check, 2026-10-20, logged out)

Asked by name ("What is Z-ALS Zurich Airport Limousine Service"), ChatGPT and Google AI Mode both describe Z-ALS
correctly (Kloten, since 2004, CHF 120 to Zürich, phone, z-als.ch as the source). They know the brand; the AEO gap
is being *recommended* for generic questions ("best limousine service Zurich airport"), which is what
`docs/seo/aeo/prompts.json`, Ubersuggest AISV and `tools/aeo-check.mjs` measure.

## Sources

- OpenAI, Design Guidelines and usage terms: https://openai.com/brand/ (read in a browser; blocks fetchers)
- Google Brand Resource Center, guidance: https://about.google/brand-resource-center/guidance/ ; trademark rules: https://www.google.com/permissions/trademark/rules/
- Microsoft Trademark and Brand Guidelines: https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks ; third-party logo guidance (Aug 2025): https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/mscle/documents/legal/intellectualproperty/trademarks/Microsoft_logo_third_party_usage_guidance_.pdf
- Anthropic newsroom (press kit, press@anthropic.com): https://www.anthropic.com/news
- Prefill behaviour: tested in a clean browser on 2026-10-20 (chatgpt.com, claude.ai, gemini.google.com, google.com AI Mode, perplexity.ai, copilot.microsoft.com).
