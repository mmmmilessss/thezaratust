import assert from 'node:assert/strict';

// Read-only production checks. Add --after-deploy to include the new SEO routes.
const paths = ['/', '/about', '/artwork/situation'];
if (process.argv.includes('--after-deploy')) paths.push('/crystyn', '/sitemap.xml', '/robots.txt');
const origins = ['https://zaratust.com', 'https://www.zaratust.com', 'http://zaratust.com', 'http://www.zaratust.com'];
let failed = 0;
for (const path of paths) {
  const query = '?domain_check=1&ref=crystyn%20music&tag=a&tag=b';
  for (const origin of origins) {
    const initial = `${origin}${path}${query}`;
    const expected = `https://zaratust.com${path}${query}`;
    const hops = [];
    let current = initial;
    const seen = new Set();
    try {
      for (;;) {
        assert(!seen.has(current), 'Redirect loop');
        assert(seen.size < 5, 'Too many redirects');
        seen.add(current);
        const response = await fetch(current, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
        const location = response.headers.get('location');
        hops.push(`${response.status} ${current}${location ? ` -> ${location}` : ''}`);
        if (response.status >= 300 && response.status < 400) {
          assert.notEqual(current, expected, 'Canonical URL must respond directly');
          assert([301, 308].includes(response.status), 'Must be permanent');
          assert(location, 'Missing Location');
          const target = new URL(location, current);
          assert.equal(target.protocol, 'https:', 'Redirect must use HTTPS');
          assert(['zaratust.com', 'www.zaratust.com'].includes(target.hostname));
          assert.equal(target.pathname, path, 'Path changed');
          assert.equal(target.search, query, 'Query changed');
          if (new URL(current).protocol === 'https:') assert.equal(target.hostname, 'zaratust.com', 'Wrong canonical host');
          current = target.href;
          continue;
        }
        assert.equal(response.status, 200, 'Expected existing page');
        assert.equal(current, expected, 'Must finish on HTTPS apex');
        break;
      }
      console.log(`PASS ${initial} (${hops.length - 1} redirects)`);
    } catch (error) {
      failed++;
      console.error(`FAIL ${initial}: ${error.message}\n  ${hops.join('\n  ')}`);
    }
  }
}
console.log(`${paths.length * origins.length - failed} passed; ${failed} failed.`);
process.exitCode = failed ? 1 : 0;
