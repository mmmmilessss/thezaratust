This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CRYSTYN search entity

- Production origin: `lib/artist.ts` (`https://zaratust.com`). `/crystyn` is the music artist page; the homepage remains the multidisciplinary portfolio.
- Profiles are shared by About and CRYSTYN. Apple Music's `6807604953` URL was read from the official Situation page on 2026-09-07; other links reuse the existing About data. Do not infer new platform handles.
- Add a music release under `content/works/<name>/data.yaml` with `artists: CRYSTYN` (or a comma-separated collaboration such as `artists: CRYSTYN, RexCudy`). The discography, artist references, release metadata and sitemap update at build time. Add only verified artist credits.
- `format: ep`, `album`, and `double single` produce MusicAlbum; `single` produces MusicRecording. Track names come from existing lyrics files, counts from `colophon.tracks`, and dates from the release data. Genre and other unverified fields are omitted.
- `/crystyn` reuses the existing `profile.jpg` photograph, copied without modification to `public/images/crystyn-artist.jpg`; Next Image supplies responsive optimized delivery and intrinsic dimensions.
- The existing SoundCloud release URL containing `mileszaratust` is preserved as an external resource address (HTTP 200 on 2026-09-07), not used as current artist identity or `sameAs`.
- The site has English and Korean text on About, not separate language routes; no fabricated hreflang alternates are emitted.
- Set optional `GOOGLE_SITE_VERIFICATION` before building to render Google's verification meta tag. Domain property verification may instead use DNS.

### Deployment and Search Console

The production host was observed redirecting `https://zaratust.com/*` to `https://www.zaratust.com/*` on 2026-09-07. Before indexing, deploy these changes and set the Vercel production domain to **zaratust.com** with **www.zaratust.com redirecting to zaratust.com**. Remove the existing opposite redirect first. Application code intentionally adds no reverse-host redirect that would loop against the current hosting rule. `/crystyn` is still 404 on the live deployment until these changes are deployed.

Then verify the domain in Search Console, submit `https://zaratust.com/sitemap.xml`, inspect `/crystyn`, and request indexing for the artist and principal releases. No Google login or verification was attempted.

### Validation

```sh
npm run build
npm run lint
npm run start -- --hostname 127.0.0.1 --port 3100
# In another terminal:
node scripts/check-seo.mjs
```

The raw-HTTP checker covers every sitemap page, unique titles/canonicals, metadata, JSON-LD syntax and entity definitions, artist links, images, local links, robots, real 404 responses, and existing redirects. Override the local target with `SEO_TEST_ORIGIN` if needed. Music schema is not a guarantee of a Google rich result or search ranking.

In the restricted local runner, Turbopack's CSS worker could not bind its port (`EPERM`), including with escalation. `npm run build -- --webpack` completed successfully without changing the project's default build configuration.

Local verification passed for 27 sitemap URLs and 8 music entities, all 27 internal link targets, artist image delivery, existing redirects, and missing-route 404s. The artist page was checked at 390px and 1440px with no horizontal overflow or console errors. Official profile URLs and the legacy SoundCloud release link returned HTTP 200. The existing Spotify embed on Situation emitted an `allow`/`allowfullscreen` precedence warning, with no console error. These are local checks, not confirmation of a production deployment or Google indexing.

### Domain normalization preflight

The canonical host remains `https://zaratust.com` everywhere in application output. Domain redirects belong to the existing Vercel project, not DNS record forwarding and not an additional Next.js reverse redirect.

In the Vercel project that currently owns both domains, open **Settings → Domains**:

1. Edit `zaratust.com`: remove its redirect to `www.zaratust.com`, connect it to the **Production** environment, and save.
2. Edit `www.zaratust.com`: set **Redirect to → zaratust.com**, select **308 Permanent Redirect**, and save. Use the domain-level redirect so each path and query are carried through; do not redirect all paths to `/`.
3. Keep the existing working DNS records. Both hosts currently reach Vercel over HTTPS; no DNS change has been established as necessary. If Vercel reports a DNS validation error, use the exact record values shown for this project, not a guessed IP or CNAME.
4. Run `node scripts/check-domains.mjs`. This checks the four HTTP/HTTPS host combinations on three existing paths, preserving encoded query values and repeated query parameters. Vercel's HTTP→HTTPS upgrade may make HTTP www use two permanent hops before reaching the HTTPS apex; no loop is allowed.
5. After deploying the SEO changes, run `node scripts/check-domains.mjs --after-deploy` to include `/crystyn`, sitemap and robots.

Reference: https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting

Domain normalization completed in Vercel on 2026-09-07: `zaratust.com` serves Production and `www.zaratust.com` redirects to the apex with a 308. All 12 HTTP/HTTPS host, path, and query preservation checks pass. Production build (`--webpack`), lint, and local SEO validation pass. Vercel recommends updating the apex A record to `216.198.79.1`; its dashboard states that the legacy `76.76.21.21` record continues to work.
