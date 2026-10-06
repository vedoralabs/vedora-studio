# Vedora Studio

Vedora Studio is a cinematic photography portfolio and client-demonstration platform built with Next.js App Router, React, TypeScript, and Tailwind CSS. Its homepage, `/work` archive, and six individual project stories are composed from local, fictional demo content.

**Vedora Intelligence** is woven into the portfolio rather than bolted on: natural-language discovery, a style explorer, a creative concierge, a creative-brief generator, a project storyteller, and a smart inquiry flow. Every feature works without an AI key (curated mode) and gets richer when a provider is configured.

## Requirements

- Node.js 20.9 or newer
- pnpm

## Getting started

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No AI key is needed: the site runs in curated mode until one is added.

## Commands

```text
pnpm dev        Start the development server
pnpm lint       Run ESLint
pnpm typecheck  Run TypeScript without emitting files
pnpm build      Create a production build
pnpm start      Serve a production build
```

## Project structure

```text
src/
  app/                 App Router pages, route metadata, global styles, and 404
    work/              Editorial archive and generated project detail routes
  components/
    home/              Homepage sections
    layout/            Shared header, footer, and layout primitives
    motion/            Scoped GSAP direction, pointer interactions, and motion utilities
    project/           Project detail, metadata, gallery, navigation, and inquiry
    ui/                Shared links, images, buttons, and project previews
    work/              Interactive category filter for the archive
    intelligence/      Discovery, explorer, concierge, brief, storyteller, inquiry, session rail
  content/             Fictional photography projects, service copy, and the visual vocabulary
  lib/                 Site configuration, discovery engine, AI layer, session memory
  types/               Project, image, category, and gallery types
public/images/          Local homepage and fictional portfolio photography
```

## Vedora Intelligence

| Feature | Where | How it works |
| --- | --- | --- |
| Natural-language discovery | Homepage "What are you looking for?", `/work` search | Words become structured facets and a ranked selection. On the homepage the contact sheet regrades the whole archive around the answer. |
| Style explorer | Homepage, `/intelligence#explorer` | Choose up to three qualities; a mood board, light note, and palette are composed from matching work. Runs entirely in the browser. |
| Creative concierge | `/intelligence#concierge` | Returns a structured "note from the studio": direction, work to look at, services, next step. Supports refinement with short session context. |
| Creative brief | `/intelligence#brief` | Six questions produce an editorial brief to print, copy, or send to the studio. |
| Project storyteller | Each project page | A clearly labelled interpretation built only from that project's metadata. |
| Smart inquiry | `/contact` | Guided choices, then an editable "here's what we understand" summary, then send. Pre-fills from a project, the concierge, or a saved brief. |
| Session memory | "Based on what you've explored…" | Viewed stories and chosen qualities, in `sessionStorage` only, with a "Forget this session" control. |

### Architecture

```text
src/lib/discovery/engine.ts   Deterministic parser, ranking, gaps, direction composer (client + server)
src/lib/discovery/results.ts  Shared result types and curated builders for every feature
src/content/vocabulary.ts     Facet labels, editorial phrases, swatches, and the word-to-facet lexicon
src/lib/ai/provider.ts        Provider abstraction and env configuration (server-only)
src/lib/ai/providers/         anthropic.ts (official SDK), openai-compatible.ts (fetch)
src/lib/ai/schema.ts          One JSON-schema subset: sent to the model and used to validate its reply
src/lib/ai/run.ts             Timeout, parse, validate, strip markup, never throw; shared safety rules
src/lib/ai/features.ts        Prompts, grounding, and curated fallback per feature
src/lib/ai/http.ts            Same-origin check, rate limit, content type, payload size, JSON parsing
src/app/api/intelligence/*    discover, brief, story, inquiry-summary
src/app/api/inquiry           Inquiry delivery to an optional HTTPS webhook
```

Each request first builds the curated result from portfolio metadata. If a provider is configured, the model is asked for schema-shaped JSON grounded in the portfolio. Its reply is validated (unknown keys or invented project slugs reject it; out-of-vocabulary facet values are dropped), stripped of markup, and merged. Any failure (no key, a 20-second timeout, rate limiting, a refusal, malformed JSON) quietly returns the curated result. Responses carry `source: "ai" | "curated"`, and the interface always labels which one the visitor is reading.

### Configuration

All AI variables are server-only. Never prefix them with `NEXT_PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `AI_PROVIDER` | `anthropic` (default), `openai`, or `openai-compatible` |
| `AI_API_KEY` | Provider key. Leave empty for curated mode. |
| `AI_MODEL` | Optional for Anthropic (defaults to `claude-opus-5-5`); required for the others |
| `AI_BASE_URL` | Required for `openai-compatible` (any `/chat/completions` endpoint with JSON-schema output) |
| `INQUIRY_WEBHOOK_URL` | HTTPS endpoint that receives inquiries as JSON (Formspree, Zapier, Make, a CRM). Without it, the flow says plainly that nothing was sent. |

The Anthropic adapter uses low effort for these short structured tasks and opts into server-side refusal fallbacks (`fallbacks: "default"`). Switch providers by changing env vars; no UI changes are needed. To add a provider, implement `AiProvider.generateJson` in `src/lib/ai/providers/`.

### Trust and safety

- The model sees only the facet metadata of fictional studies. It is instructed never to invent clients, awards, results, credits, dates, or locations, and never to present demo work as real commissions.
- Visitor text is cleaned, length-limited, and wrapped in `<visitor_*>` tags as untrusted data. Prompts never reach the browser.
- Public endpoints accept same-origin JSON only, enforce payload limits (0.5–8 KB), and are rate-limited per IP. The limiter is in-memory per server instance; back it with a shared store (for example Redis) for multi-region traffic.
- Logs record only the failure category, never visitor input or model output.

## Content model

Project records live in `src/content/projects.ts` and conform to `PhotographyProject` in `src/types/project.ts`. Each record carries its route slug, title, category, location, year, description, cover image, gallery sections, and `facets`: subjects, visual qualities, moods, lighting, palette, composition, location type, keywords, and services. Facets must describe what is visible in the photographs. They power search, recommendations, the explorer, related work, and AI grounding. After editing them, run `npx tsx scripts/check-discovery.ts` to see how sample queries resolve. A gallery section selects a supported layout (`fullBleed`, `split`, `asymmetric`, `stacked`, `threeUp`, or `horizontal`) and supplies its own image data. The UI reads that content model so a future content source can replace the sample records without rewriting the pages.

All current project stories are fictional portfolio studies and use local generated demonstration images. They do not represent real client relationships, awards, or published work. Add approved imagery under `public/images/projects/`, then update the matching content record and meaningful alt text. Never add unapproved client details to fictional records.

## Configuration and SEO

Set `NEXT_PUBLIC_SITE_URL` to the deployed canonical origin and `NEXT_PUBLIC_CONTACT_EMAIL` to the studio's approved public inquiry address. Add only confirmed social URLs to `socialLinks` in `src/lib/site-config.ts`. Values prefixed with `NEXT_PUBLIC_` are exposed to browsers and must never contain secrets.

`/sitemap.xml`, `/robots.txt` (which disallows `/api/`), Organization and WebSite JSON-LD on the homepage, and CreativeWork JSON-LD on each project (marked as a fictional demonstration study) are generated from the same content. The work archive has canonical metadata. Each project route generates its title, description, canonical URL, and Open Graph/Twitter image from the project record. Unknown slugs use the App Router not-found route.

## Visual system and accessibility

- Brand colors, typography scale, spacing, gutters, and container widths live in `src/app/tokens.css`.
- Global, responsive, focus, archive, project, gallery, lightbox, and reduced-motion styles live in `src/app/globals.css`.
- The homepage is assembled in `src/app/page.tsx`; archive and dynamic project routes live in `src/app/work/`.
- Pages and content remain server-rendered by default. Client boundaries are limited to archive filtering, the motion director, desktop service previews, and gallery/lightbox interactions.
- Next Image provides responsive image delivery and lazy loading for below-the-fold project imagery. Only homepage and project hero images are prioritized.
- GSAP and its ScrollTrigger plugin provide scoped hero, editorial, image, and scroll reveals. Match-media contexts revert animations on route changes, breakpoints, and reduced-motion changes.
- Pointer-only service previews, magnetic links, and the decorative cursor are limited to fine-pointer desktop use. The native browser cursor remains visible.
- The interface uses semantic landmarks, keyboard-visible focus, descriptive alt text, a skip link, accessible filter state, a native modal dialog, and reduced-motion support.

The subtle hero depth effect is hand-written WebGL (no Three.js), loaded only on capable desktop devices after the hero has settled.

Beyond Next and React, the only runtime dependencies are GSAP and `@anthropic-ai/sdk` (server-only). No state-management library, CMS, authentication, Three.js, or smooth-scrolling dependency is installed. Route changes stay immediate and scrolling remains native.

## Security headers

`next.config.ts` sets a Content Security Policy (same-origin only, with no third-party scripts or connections), `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, a restrictive `Permissions-Policy`, COOP, and HSTS in production. The CSP is nonce-free so every page stays statically rendered; Next's inline bootstrap requires `'unsafe-inline'` for scripts.
