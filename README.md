# Vedora Studio

Vedora Studio is a cinematic photography portfolio and client-demonstration platform built with Next.js App Router, React, TypeScript, and Tailwind CSS. Its homepage, `/work` archive, and six individual project stories are composed from local, fictional demo content.

## Requirements

- Node.js 20.9 or newer
- pnpm

## Getting started

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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
  content/             Fictional photography projects and service copy
  lib/                 Centralized site configuration
  types/               Project, image, category, and gallery types
public/images/          Local homepage and fictional portfolio photography
```

## Content model

Project records live in `src/content/projects.ts` and conform to `PhotographyProject` in `src/types/project.ts`. Each record carries its route slug, title, category, location, year, description, cover image, and gallery sections. A gallery section selects a supported layout (`fullBleed`, `split`, `asymmetric`, `stacked`, `threeUp`, or `horizontal`) and supplies its own image data. The UI reads that content model so a future content source can replace the sample records without rewriting the pages.

All current project stories are fictional portfolio studies and use local generated demonstration images. They do not represent real client relationships, awards, or published work. Add approved imagery under `public/images/projects/`, then update the matching content record and meaningful alt text. Never add unapproved client details to fictional records.

## Configuration and SEO

Set `NEXT_PUBLIC_SITE_URL` to the deployed canonical origin and `NEXT_PUBLIC_CONTACT_EMAIL` to the studio's approved public inquiry address. Add only confirmed social URLs to `socialLinks` in `src/lib/site-config.ts`. Values prefixed with `NEXT_PUBLIC_` are exposed to browsers and must never contain secrets.

The work archive has canonical metadata. Each project route generates its title, description, canonical URL, and Open Graph/Twitter image from the project record. Unknown slugs use the App Router not-found route.

## Visual system and accessibility

- Brand colors, typography scale, spacing, gutters, and container widths live in `src/app/tokens.css`.
- Global, responsive, focus, archive, project, gallery, lightbox, and reduced-motion styles live in `src/app/globals.css`.
- The homepage is assembled in `src/app/page.tsx`; archive and dynamic project routes live in `src/app/work/`.
- Pages and content remain server-rendered by default. Client boundaries are limited to archive filtering, the motion director, desktop service previews, and gallery/lightbox interactions.
- Next Image provides responsive image delivery and lazy loading for below-the-fold project imagery. Only homepage and project hero images are prioritized.
- GSAP and its ScrollTrigger plugin provide scoped hero, editorial, image, and scroll reveals. Match-media contexts revert animations on route changes, breakpoints, and reduced-motion changes.
- Pointer-only service previews, magnetic links, and the decorative cursor are limited to fine-pointer desktop use. The native browser cursor remains visible.
- The interface uses semantic landmarks, keyboard-visible focus, descriptive alt text, a skip link, accessible filter state, a native modal dialog, and reduced-motion support.

No state-management library, CMS, authentication, API, Three.js, WebGL, or smooth-scrolling dependency is installed. Route changes stay immediate and scrolling remains native.
