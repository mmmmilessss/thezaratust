import assert from 'node:assert/strict';

// Run against `next start`, not a deployment preview with authentication.
const origin = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:3100';
const production = 'https://zaratust.com';
const artistId = `${production}/crystyn#artist`;
const text = (value) => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
const attr = (tag, name) => text(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || '');
const metas = (html, key) => [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => tag).filter((tag) => attr(tag, 'name') === key || attr(tag, 'property') === key).map((tag) => attr(tag, 'content'));
const titles = new Set();
const canonicals = new Set();
const links = new Set();
const failures = [];
const sitemap = await fetch(`${origin}/sitemap.xml`);
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
assert(!xml.includes('<lastmod>'), 'Do not synthesize modification dates');
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => text(match[1]));
assert.equal(new Set(urls).size, urls.length);
for (const path of ['/', '/crystyn', '/artwork/situation', '/artwork/tiny-thoughts-club']) assert(urls.includes(production + path));
let releaseCount = 0;
for (const url of urls) {
  assert(url.startsWith(production + '/'));
  const response = await fetch(origin + new URL(url).pathname, { redirect: 'manual' });
  assert.equal(response.status, 200, url);
  assert(!/noindex|nofollow/i.test(response.headers.get('x-robots-tag') || ''), url);
  const html = await response.text();
  assert(!/https?:\/\/www\.zaratust\.com/i.test(html), `Noncanonical www URL in rendered HTML: ${url}`);
  assert(!/http:\/\/zaratust\.com/i.test(html), `Insecure production URL in rendered HTML: ${url}`);
  const title = text(html.match(/<title>(.*?)<\/title>/s)?.[1] || '');
  assert(title && !titles.has(title), `Missing or duplicate title: ${url} ${title}`);
  titles.add(title);
  const canonicalTags = [...html.matchAll(/<link\b[^>]*>/g)].filter(([tag]) => attr(tag, 'rel') === 'canonical');
  assert.equal(canonicalTags.length, 1, url);
  const canonical = attr(canonicalTags[0][0], 'href');
  assert.equal(new URL(canonical).href, new URL(url).href);
  assert(!canonicals.has(canonical)); canonicals.add(canonical);
  assert.equal(metas(html, 'description').length, 1);
  assert(!metas(html, 'robots').some((v) => /noindex|nofollow/.test(v)));
  for (const key of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert.equal(metas(html, key).length, 1, `${url}: ${key}`);
  assert.equal(new URL(metas(html, 'og:url')[0]).href, new URL(url).href);
  assert(!/Miles Zaratust/i.test(title + metas(html, 'description').join('')));
  const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1]));
  const definitions = new Set();
  function walk(value) {
    assert(value !== null, url);
    if (typeof value !== 'object') return;
    if (value['@id']) {
      new URL(value['@id']);
      if (value['@type']) { assert(!definitions.has(value['@id']), `Duplicate entity definition ${value['@id']}`); definitions.add(value['@id']); }
    }
    if (value.sameAs) for (const item of value.sameAs) assert.equal(new URL(item).protocol, 'https:');
    for (const [key, child] of Object.entries(value)) {
      if (['url', 'image'].includes(key) && typeof child === 'string') assert.equal(new URL(child).protocol, 'https:');
      walk(child);
    }
  }
  data.forEach(walk);
  for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(tag, 'href');
    if (href.startsWith('/') && !href.startsWith('//')) links.add(href.split('#')[0]);
  }
  const release = data.find((item) => ['MusicAlbum', 'MusicRecording'].includes(item['@type']));
  if (release) {
    releaseCount++;
    assert(release.byArtist.some((artist) => artist['@id'] === artistId));
    assert(html.includes('href="/crystyn"'));
    assert.equal(title, `${release.name} — ${release.byArtist.map((artist) => artist['@id'] === artistId ? 'CRYSTYN' : artist.name).join(' & ')}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    if (release.track) {
      assert.equal(release.numTracks, release.track.length);
      for (const track of release.track) assert(html.includes(track.name.replaceAll('&', '&amp;').replaceAll("'", '&#x27;')) || html.includes(track.name));
    }
  }
  if (url.endsWith('/crystyn')) {
    assert.equal(title, 'CRYSTYN — Artist & Producer');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const artist = data.flatMap((item) => item['@graph'] || []).find((item) => item['@id'] === artistId);
    assert.equal(artist['@type'], 'MusicGroup');
    assert(artist.sameAs.some((link) => link.includes('/6807604953')));
    for (const href of artist.sameAs) assert(html.includes(`href="${href.replaceAll('&', '&amp;')}"`));
    const image = [...html.matchAll(/<img\b[^>]*>/g)].find(([tag]) => attr(tag, 'alt') === 'CRYSTYN artist portrait')?.[0];
    assert(image && Number(attr(image, 'width')) > 0 && Number(attr(image, 'height')) > 0);
    const imageResponse = await fetch(origin + attr(image, 'src'));
    assert.equal(imageResponse.status, 200);
    assert(imageResponse.headers.get('content-type')?.startsWith('image/'));
    const shareImage = await fetch(origin + new URL(metas(html, 'og:image')[0]).pathname);
    assert.equal(shareImage.status, 200);
  }
}
for (const path of links) {
  const response = await fetch(origin + path);
  if (response.status !== 200) failures.push(`${path}: ${response.status}`);
}
assert.deepEqual(failures, [], 'Broken internal links');
for (const path of ['/crystyn/not-real', '/artwork/not-real', '/projects/not-real', '/work/not-real']) assert.equal((await fetch(origin + path)).status, 404, path);
for (const [path, target] of [['/projects/tiny-thougts-club', '/projects/tiny-thoughts-club'], ['/artwork/film-tiny-thougts-club-full-ep-listening-experience', '/artwork/film-tiny-thoughts-club-full-ep-listening-experience'], ['/work/others', '/work']]) {
  const response = await fetch(origin + path, { redirect: 'manual' });
  assert([301, 308].includes(response.status));
  assert.equal(response.headers.get('location'), target);
  assert.equal((await fetch(origin + target)).status, 200);
}
const robots = await fetch(`${origin}/robots.txt`);
assert.equal(robots.status, 200);
const rules = await robots.text();
assert(rules.includes('Allow: /') && rules.includes(`Sitemap: ${production}/sitemap.xml`));
assert(!rules.includes('Disallow: /'));
console.log(`PASS: ${urls.length} indexable URLs; ${releaseCount} music entities; ${links.size} internal links; metadata, raw HTML, JSON-LD, images, robots, sitemap, 404s and redirects.`);
