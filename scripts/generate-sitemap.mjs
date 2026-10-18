// Generates public/sitemap.xml from Firestore (active products + active categories).
// Runs before every build: "build": "node scripts/generate-sitemap.mjs && vite build"
// Uses the Firestore REST API with no keys, because your rules already allow
// public reads of active products and active categories.
// If Firestore can't be reached, the build continues with the static pages only
// and keeps the existing public/sitemap.xml if there is one.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_URL = 'https://dripnest.site';
const PROJECT_ID = 'dripnest-2a269';
const OUTPUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/sitemap.xml'
);

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/shop', priority: '0.9', changefreq: 'daily' },
  { loc: '/wholesale', priority: '0.7', changefreq: 'weekly' },
  { loc: '/about', priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
  { loc: '/reviews', priority: '0.5', changefreq: 'weekly' },
  { loc: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
  { loc: '/terms-and-conditions', priority: '0.2', changefreq: 'yearly' },
  { loc: '/shipping-policy', priority: '0.2', changefreq: 'yearly' },
  { loc: '/returns-and-refunds', priority: '0.2', changefreq: 'yearly' },
];

export const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export function buildSitemap(entries) {
  const urls = entries
    .map((e) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(SITE_URL + e.loc)}</loc>`,
      ];
      if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority) lines.push(`    <priority>${e.priority}</priority>`);
      for (const img of e.images || []) {
        lines.push(
          '    <image:image>',
          `      <image:loc>${escapeXml(img)}</image:loc>`,
          '    </image:image>'
        );
      }
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/image/1.1">
${urls}
</urlset>
`;
}

async function runQuery(collectionId, fieldPath, value) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collectionId }],
          where: {
            fieldFilter: {
              field: { fieldPath },
              op: 'EQUAL',
              value,
            },
          },
          limit: 1000,
        },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) {
    throw new Error(`Firestore ${collectionId} query failed: ${res.status}`);
  }

  const rows = await res.json();
  return rows.filter((r) => r.document).map((r) => r.document.fields || {});
}

const str = (f) => (f && typeof f.stringValue === 'string' ? f.stringValue : '');
const ts = (f) => (f && (f.timestampValue || null)) || null;

async function fetchDynamicEntries() {
  const [products, categories] = await Promise.all([
    runQuery('products', 'status', { stringValue: 'active' }),
    runQuery('categories', 'active', { booleanValue: true }),
  ]);

  const entries = [];

  for (const f of categories) {
    const slug = str(f.slug);
    if (!slug) continue;
    entries.push({
      loc: `/category/${encodeURIComponent(slug)}`,
      lastmod: toDate(ts(f.updatedAt) || ts(f.createdAt)),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const f of products) {
    const slug = str(f.slug);
    if (!slug) continue;
    const images = (f.images?.arrayValue?.values || [])
      .map((v) => v.stringValue)
      .filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
      .slice(0, 5);
    entries.push({
      loc: `/product/${encodeURIComponent(slug)}`,
      lastmod: toDate(ts(f.updatedAt) || ts(f.createdAt)),
      changefreq: 'weekly',
      priority: '0.7',
      images,
    });
  }

  return entries;
}

async function main() {
  let dynamicEntries = [];

  try {
    dynamicEntries = await fetchDynamicEntries();
    console.log(`[sitemap] ${dynamicEntries.length} product/category URLs from Firestore`);
  } catch (err) {
    console.warn('[sitemap] Could not read Firestore:', err.message);
    try {
      await readFile(OUTPUT, 'utf8');
      console.warn('[sitemap] Keeping the existing public/sitemap.xml');
      return;
    } catch {
      console.warn('[sitemap] No existing sitemap; writing static pages only');
    }
  }

  const xml = buildSitemap([...STATIC_PAGES, ...dynamicEntries]);
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, xml, 'utf8');
  console.log(`[sitemap] Wrote ${OUTPUT}`);
}

// Only run when executed directly (not when imported for testing)
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    // Never fail the deploy because of the sitemap
    console.warn('[sitemap] Unexpected error:', err);
  });
}
