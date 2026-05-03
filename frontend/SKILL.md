---
name: frontend
description: Use when working in the Mayra Jewelry frontend (Next.js 15 App Router, React 19, Tailwind, Zustand, NextAuth, Framer Motion, GSAP, Lenis, Three.js). Apply for any UX/UI work, component changes, mobile-first responsive design, SEO/metadata, image optimization, accessibility, animations, auth, or secrets handling on the frontend. The brand is luxury jewelry — every decision defends precision, restraint, and tactility.
---

# Frontend SKILL — Mayra Jewelry

A working agreement for any agent or engineer touching this codebase. Read it before changing code; revise it when the truths here drift.

The brand is luxury jewelry. Every change should defend that: precision, restraint, tactility. If a change makes the site feel cheaper, slower, or louder, it does not ship.

---

## 1. Stack & where things live

- **Next.js 15.5.4 (App Router) + React 19** — `src/app/**`. Server Components by default; `"use client"` only when state, effects, or browser APIs are required.
- **TypeScript 5.8** with `strict: true`, `noUnusedLocals`, `noUnusedParameters` ([tsconfig.app.json](tsconfig.app.json)).
- **Tailwind 3.4** — design tokens live in [tailwind.config.js](tailwind.config.js). Never hardcode hex colors in JSX.
- **Zustand 5** for client state — single store at [src/stores/CartCountProvider.tsx](src/stores/CartCountProvider.tsx).
- **NextAuth 5 (beta)** with Facebook OAuth — config in [src/app/auth.ts](src/app/auth.ts).
- **Animation:** Framer Motion (component-level), GSAP + ScrollTrigger (timelines), Lenis (smooth scroll), Three.js / @react-three/fiber (3D backgrounds).
- **Server-side data access** is centralized in [src/server/data.ts](src/server/data.ts). Do not call the backend directly from a component.
- **Shared types** live in [types.ts](types.ts).

Routes: `/`, `/product/[id]`, `/cart`, `/wishlist`, `/account`, `/search` (stub), `/collections/[collectionName]` (stub), `/privacy`, `/delete`.

---

## 2. Coding standards (non-negotiable)

1. **Strict typing or no merge.** No `any`. No implicit `any`. Use `unknown` at boundaries (parsed JSON, `localStorage`, `postMessage`) and narrow before use. Treat [types.ts](types.ts) as authoritative — extend it, don't recreate types inline.
2. **Validate every untrusted boundary.** Add Zod (not installed yet). One schema per boundary, parse once, pass typed data inward. Today [GridItem.tsx](src/components/Jewelry/GridItem.tsx), [Wrapper.tsx](src/app/product/[id]/Wrapper.tsx), and [Navigation/index.tsx](src/components/Navigation/index.tsx) all `JSON.parse` from `localStorage` without validation — each is a latent crash.
3. **Never `dangerouslySetInnerHTML` API-derived content.** [LoginForm.tsx:31](src/components/LoginForm/LoginForm.tsx#L31) currently does this with `title`; if `title` ever flows from a server response or query string, it is XSS.
4. **Server vs client boundary.** [src/server/data.ts](src/server/data.ts) is server-only. Don't import it into a `"use client"` file.
5. **No `alert()` / `confirm()`.** They block, look cheap, and break the brand. Build a toast primitive (`sonner` is fine) and ban the globals via ESLint `no-restricted-globals`.
6. **No `window.location.reload()` to recover from bad state.** [Navigation/index.tsx:59-61](src/components/Navigation/index.tsx#L59-L61) is the smell — fix the state machine instead.
7. **Comments only justify *why*.** Names should explain *what*. Delete comments that paraphrase the next line.
8. **CI gate:** `tsc --noEmit` and `next lint` must run on every PR.

---

## 3. Authentication & secrets — industry-standard discipline

**What's wrong today:** [frontend/.env](.env) is committed and contains `AUTH_FACEBOOK_SECRET` and `AUTH_SECRET` in plaintext. This is a credential leak; treat it as an incident.

**Required workflow (do this before any other change):**

1. **Rotate immediately.** Revoke the Facebook app secret in Meta for Developers and regenerate `AUTH_SECRET` (`openssl rand -base64 32`).
2. **Move secrets to `.env.local`.** Only `.env.local` is gitignored by Next.js convention; the committed `.env` is not. Delete server secrets from `.env`, keep only `NEXT_PUBLIC_*` keys in [.env_sample](.env_sample) for onboarding.
3. **Purge git history.** `git filter-repo --path frontend/.env --invert-paths` (or `bfg`), then force-push and have everyone re-clone.
4. **Naming rule:** anything prefixed `NEXT_PUBLIC_` is *shipped to the browser*. Treat that prefix as a public-disclosure switch — never put a secret behind it. Today only `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_TAWK_*` qualify.
5. **Pre-commit hook:** add `gitleaks` or `trufflehog` so this can't recur silently.

**Auth conventions:**

- Sessions are managed by NextAuth — never roll your own cookie or `localStorage` token.
- Read auth state with `useSession()` (client) or `auth()` (server). Don't trust user IDs from query strings or props.
- `signIn('facebook', { redirectTo })` — sanitize `redirectTo` against an allowlist of internal paths to prevent open-redirect.
- The `#_=_` hash hack ([Navigation/index.tsx:51-57](src/components/Navigation/index.tsx#L51-L57)) is a documented Facebook OAuth quirk; leave a comment so nobody "cleans it up."
- Treat the backend as untrusted today: it has no auth (see backend SKILL). The user ID in URLs is a hint, not an identity. Don't render anything sensitive based on it without server-side verification.

---

## 4. UX/UI — modern, immersive, inviting

The brand is luxury. The atmosphere ingredients (3D cloth, Lenis, GSAP) are right; the catalog itself reads like a generic e-commerce template. Hold every change to these standards.

### 4.1 Latest industry standards (2025)

- **Motion is choreographed, not decorated.** Animations communicate hierarchy and state — don't add a fade just because you can. Every motion has a reason: arrival, attention, transition, feedback. Reuse the same easing curves and durations across the app (define them as Tailwind tokens, not magic numbers).
- **Respect `prefers-reduced-motion`.** Today no GSAP, Lenis, or Three.js setup checks it. Wrap each in `if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;` or scale durations to 0.
- **Tactile, not flat.** Luxury reads through micro-interactions: pressed states with sub-pixel transforms (`active:scale-[0.98]`), spring-eased hover lifts, generous padding, hairline borders (`border-[0.5px]`). Avoid harsh shadows and pure-black text — use `text-zinc-900` and shadow with low opacity.
- **Stop fighting Next/Image.** Combining `width`/`height` props with `style={{ width:'auto', height:'auto' }}` (as in [GridItem.tsx](src/components/Jewelry/GridItem.tsx)) defeats responsive sizing. Section 6 covers this in depth.
- **Optimistic UI for cart and wishlist.** Update Zustand immediately; reconcile on response. The current 750ms throttle in cart updates feels like lag.
- **Skeletons over spinners.** Spinners read as "loading"; skeletons read as "intentional." Build skeletons for product grid, product page, cart, wishlist, order list. Reserve `<Loading>` for full-page transitions only.
- **Toasts for feedback.** Replace every `alert()` with a toast from a single primitive. Position bottom-right on desktop, bottom-center on mobile.
- **Empty states have personality.** A blank wishlist isn't "0 items" — it's a curated CTA with an illustration and a tip ("Tap the heart on a piece you love").
- **Accessibility is launch-blocking.**
  - Every icon-only `<button>` needs `aria-label`. The cart icon, wishlist toggle, sign-in float, and modal close currently don't.
  - `<span onClick>` patterns ([Variation.tsx](src/components/Jewelry/Variation.tsx) and elsewhere) must become `<button>` for free keyboard focus + Enter/Space activation.
  - Visible focus ring globally: `focus-visible:ring-2 ring-brand-400 ring-offset-2`. Don't rely on browser defaults.
  - Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text. Validate the tertiary button hover combinations specifically.
  - Modal traps focus and returns it on close (the existing [Modal.tsx](src/components/Modal/Modal.tsx) does Escape but not focus-trap — fix it).

### 4.2 Brand-specific direction

- **The cloth + sparkle background** ([components/Background/ClothBackground.tsx](src/components/Background/ClothBackground.tsx)) is the strongest brand asset. Make it cheaper (see image/perf section), then push it harder: a parallax response on scroll, subtle color shift between sections, and a delicate drop into stillness when the page is idle.
- **Product hero moments.** Each product page deserves a 3D model viewer (the Three.js stack is already there) or, at minimum, a multi-image gallery with cursor-following zoom on desktop and pinch-zoom on touch. Today only one thumbnail is shown.
- **Variations** ([Variation.tsx](src/components/Jewelry/Variation.tsx)) — scale up the swatches, add subtle metallic gradients, animate the price between variations rather than swapping a static number.
- **Card hover** previews a second image (lifestyle / on-model) with a single crossfade — instantly premium.
- **Typography:** the CocoBiker font is loaded inline in a `style` tag at [Bio.tsx:87](src/components/Bio.tsx#L87). Move all custom faces into `next/font/local` so they self-host with `font-display: swap`, are preconnected, and are subset. Define a type scale in [tailwind.config.js](tailwind.config.js) (display / heading / body / caption) with letter-spacing and leading per step. Stop one-off `text-[42px]`.

---

## 5. Mobile-first development

The current build is desktop-first: navigation is hidden under `sm` and there is no mobile menu. That makes mobile broken, not "responsive." Reverse the priority.

### 5.1 Process rules

- **Design and code at 375px first**, then progressively enhance with `sm:`, `md:`, `lg:`, `xl:`. Tailwind's default breakpoints are min-width — that's the mobile-first direction. If you find yourself writing `max-sm:`, you're working backwards.
- **Test on real devices.** Chrome DevTools' mobile emulation lies about touch latency, viewport quirks, and font rendering. Keep an iPhone (Safari) and a mid-range Android (Chrome) on your desk.
- **Touch targets ≥ 44×44 CSS pixels** (Apple HIG) or 48×48 (Material). The cart circle and variation swatches are smaller today — fix them.
- **One-thumb reach.** Primary actions belong in the bottom 60% of the viewport on mobile. The "Add to cart" button on a product page should sit above the fold near the bottom, not at the top after a scroll.
- **No hover-only affordances.** Anything that reveals on hover must also work on tap. Card hover previews need a tap-to-flip alternative.
- **Use `100dvh`, not `100vh`.** iOS Safari's dynamic toolbar makes `100vh` overflow. The cloth background canvas should read `100dvh`.
- **Inputs:** set the right `inputMode` and `type` so the correct mobile keyboard appears. The QR confirmation modal's "last 5 digits of account" field needs `inputMode="numeric"` and `pattern="[0-9]*"` — today it accepts arbitrary text.
- **Disable iOS auto-zoom on focus** by ensuring inputs are at least 16px (`text-base`).

### 5.2 Specific mobile work to ship before relaunch

- **Mobile navigation drawer** — full-height frosted backdrop, swipe-to-close, focus-trapped. Today nothing exists below `sm`. Until this lands, mobile is broken.
- **Sticky bottom CTA** on product pages: price + Add-to-cart pinned to the bottom of the viewport, hidden on scroll-down, revealed on scroll-up.
- **Cart drawer** instead of a full-page route on mobile — keeps context, preserves scroll position.
- **Modal width** in [QRCodeImage.tsx](src/components/PaymentView/QRCodeImage.tsx) is hardcoded `width: 320px`; make it `max-w-[90vw]` with a sensible cap.
- **Safe-area insets** — wrap any fixed-bottom element in `pb-[env(safe-area-inset-bottom)]` so it clears the home indicator on iPhone.

---

## 6. Image optimization

Images are the single biggest bandwidth and rendering cost on a jewelry site. Get this right and Lighthouse scores follow.

### 6.1 Always use `next/image`, correctly

- Use `fill` + a sized parent (`relative aspect-square`) + `sizes` for responsive layouts. Don't combine fixed `width`/`height` with `style={{ width:'auto', height:'auto' }}` — that's the worst of both modes (no responsive optimization, no aspect-ratio guarantee). Fix [GridItem.tsx](src/components/Jewelry/GridItem.tsx) and [Cart Card.tsx](src/app/cart/Card.tsx) accordingly.
- **`sizes` is required when using `fill`.** Pattern for a 4-column grid: `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`. Without it, Next/Image serves the largest variant.
- **`priority` only on the LCP image.** One per page. Today multiple cards set `priority` — that defeats lazy-loading and bloats the preload list.
- **`placeholder="blur"`** with a server-generated `blurDataURL` for product hero images. For external R2 URLs, generate the LQIP at upload time on the backend and pass it through the API; do not generate it on every request.
- **`fetchPriority="high"`** for the hero image and `loading="lazy"` for everything below the fold (Next/Image does the latter automatically).

### 6.2 Format and pipeline

- **AVIF first, WebP fallback, original last.** Configure [next.config.mjs](next.config.mjs) with `images.formats: ['image/avif', 'image/webp']`. Next/Image negotiates by `Accept` header.
- **Size variants.** `images.deviceSizes` and `imageSizes` should match your real layout breakpoints — the defaults are too generous and bloat the cache. Set them to `[360, 640, 768, 1024, 1280, 1536, 1920]`.
- **R2 / Cloudflare Images.** Either (a) use Cloudflare Images for on-the-fly transforms, or (b) pre-generate sized variants at upload and store all of them in R2. Don't fetch a 4000×4000 master and let Next/Image transcode it on every cold request — that's CPU and egress you pay for.
- **Long-cache headers** on R2 objects: `Cache-Control: public, max-age=31536000, immutable` plus content-hashed filenames. Configure once at bucket level.

### 6.3 Three.js / canvas budget

- **Clamp DPR:** `gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`. Phones with DPR=3 will otherwise render 9× more pixels than necessary.
- **Reduce geometry:** [ClothBackground.tsx](src/components/Background/ClothBackground.tsx) uses 100×100 segments. Drop to 60×60 — the visual difference is invisible, the GPU savings are not.
- **Pause when offscreen:** wrap `useFrame` in an `IntersectionObserver`-driven gate. Burning 60fps on a canvas that's scrolled out of view is wasted heat.
- **Lazy-load** the canvas: `const Cloth = dynamic(() => import('./ClothBackground'), { ssr: false, loading: () => null })`.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, skip the canvas entirely and render a static gradient.

### 6.4 Logo and icons

- **Logo:** SVG only. Today [public/](public/) has `logo.webp` — replace with `logo.svg`. Inline critical-path SVG for the navigation logo to avoid a render-blocking request.
- **Icons:** `lucide-react` is already a dep — use its tree-shaken named imports. Don't pull `import * as Icons` patterns.

---

## 7. SEO

E-commerce SEO compounds: every product page is a long-tail landing page. Today the site ships almost nothing.

### 7.1 Metadata

- **Per-route `generateMetadata`.** [src/app/product/[id]/page.tsx](src/app/product/[id]/page.tsx) is the priority — title (`{name} | Mayra Jewelry`), description (first 155 chars of product description), `openGraph.images` (the actual product, not the brand logo), `twitter.card: 'summary_large_image'`. Today every page shares one OG image.
- **Root metadata** in [src/app/layout.tsx](src/app/layout.tsx) — `metadataBase`, `title.template` (`'%s | Mayra Jewelry'`), `title.default`, default description, default OG.
- **Canonical URLs.** `alternates: { canonical: '/' }` per route. Required to dedupe `?ref=`, `?utm_*`, and the trailing-slash variants.

### 7.2 Structured data (JSON-LD)

- **Product schema** on `/product/[id]`: `@type: Product`, `name`, `image`, `description`, `sku`, `brand`, `offers` (with `price`, `priceCurrency`, `availability`, `priceValidUntil`). Google Search Console will surface rich results once this is in place. Render via a `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` (the one legitimate use of `dangerouslySetInnerHTML` — the input is server-controlled).
- **Organization schema** on the home page: `name`, `url`, `logo`, `sameAs` (Facebook, Instagram, etc.).
- **BreadcrumbList** on product and collection pages.
- **WebSite schema** with `potentialAction: SearchAction` once `/search` is real.

### 7.3 Crawl & indexability

- **`app/sitemap.ts`** — generate dynamically from the catalog. Include `lastModified` from the product `updatedAt`.
- **`app/robots.ts`** — allow `/`, disallow `/account`, `/cart`, `/wishlist`, `/api/*`. Reference the sitemap.
- **No noindex on product pages.** Verify by inspecting the headers in production.
- **Internal linking.** Related products on each product page (the existing [MostViewed.tsx](src/app/product/[id]/MostViewed.tsx) is the right shape — keep it). Collection pages should link to every product they contain.
- **URL hygiene.** Slugs over IDs where possible — `/product/eternity-band-rose-gold` reads better than `/product/{base64}`. If the backend returns IDs, render `/product/{slug}--{id}` and parse.

### 7.4 Performance feeds SEO

Core Web Vitals are a ranking signal. Hit these on the affected route in mobile Lighthouse:

- **LCP < 2.5s** — driven mostly by the product hero image. Section 6 is the lever.
- **INP < 200ms** — driven by main-thread blocking. Code-split the 3D background and any non-critical JS behind `next/dynamic({ ssr: false })`.
- **CLS < 0.1** — set explicit `aspect-ratio` on every image and embed slot. Variation circles must reserve space before the data arrives.

### 7.5 Caching

- **`revalidate`** on read-only catalog fetches in [src/server/data.ts](src/server/data.ts): `{ next: { revalidate: 300, tags: ['catalog'] } }` for collections, `revalidate: 60` for the home grid. Today every render is `no-store` for dynamic routes, hammering the backend and harming TTFB (which feeds LCP).
- **`revalidateTag('catalog')`** from any admin mutation route once those exist.

---

## 8. State, forms, errors

- **Cart state** (Zustand) is the single source of truth. Mirror to `localStorage` with a versioned schema (`{ v: 1, items: ... }`) and migrate on read. Today a model change crashes returning users.
- **Forms:** add `react-hook-form` + `zod` and use `zodResolver`. The QR confirmation modal ([QRCodeImage.tsx](src/components/PaymentView/QRCodeImage.tsx)) is the highest-priority migration — currently it accepts arbitrary input and only disables the submit button by length.
- **Error boundaries:** add `app/error.tsx` and per-route `error.tsx` for `/product/[id]`, `/cart`, `/account`. A thrown server-component error currently takes the page down with no recovery path.
- **Toast primitive** before banning `alert`/`confirm`.

---

## 9. Component conventions

- One folder per component: `Component/index.tsx` (default export) + co-located styles/sub-components.
- Props are typed with a named `interface ComponentNameProps`. No anonymous inline shapes for components that take more than one prop.
- Animations live inside the component that owns them. If two components share an animation, lift it to a hook (`useFadeIn`, `useScrollReveal`) under `src/hooks/`.
- When you find duplication ([BestSeller](src/components/Jewelry/BestSeller.tsx) and [FeatureCollections](src/components/Jewelry/FeatureCollections.tsx) are the obvious case), extract a `<ProductGrid>` — but only on the second duplicate, not preemptively.

---

## 10. What not to do

- Do not add `eslint-disable` to silence a warning. Fix the cause.
- Do not add a third animation library. We have enough.
- Do not introduce CSS-in-JS. Tailwind is the standard.
- Do not commit `.env`, `.DS_Store`, or `node_modules`. The current [.gitignore](.gitignore) is too thin — strengthen it.
- Do not bypass [src/server/data.ts](src/server/data.ts) and call the backend directly from a component file.
- Do not add features to stub routes (`/search`, `/collections/...`) without a design — half-built features hurt the brand more than their absence.

---

## 11. Definition of done (per PR)

1. `tsc --noEmit` clean.
2. `next lint` clean.
3. Manual walkthrough on a real iPhone *and* a real Android, then desktop: home → product → cart → checkout (QR) → account.
4. Lighthouse (mobile) on the affected route: Performance ≥ 80, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
5. CWV: LCP < 2.5s, INP < 200ms, CLS < 0.1.
6. No new `any`, no new `dangerouslySetInnerHTML` (except JSON-LD), no new `alert`/`confirm`.
7. If the change touches the catalog, payment, or auth: PR description includes screenshots (mobile + desktop) and a test plan.
