/*
 * Fill in `pages:` for library entries from the Open Library search API.
 *
 *   node scripts/fetch-page-counts.mjs            # only entries missing pages
 *   node scripts/fetch-page-counts.mjs --refresh  # re-fetch every entry
 *   node scripts/fetch-page-counts.mjs --dry-run  # report, write nothing
 *
 * Run on demand, not at build time. A page count never changes, and making
 * every `astro build` depend on a third-party API would mean no offline builds
 * and a deploy that can fail because someone else's service is down.
 *
 * Open Library needs no key. It returns several editions per work with
 * different counts, so a match is scored on title, author and publication year
 * rather than taking the first row, and anything outside a sane page range is
 * dropped instead of written.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const LIBRARY = path.join(process.cwd(), "src/content/library");
const API = "https://openlibrary.org/search.json";
const MIN_PAGES = 8;
const MAX_PAGES = 5000;

const refresh = process.argv.includes("--refresh");
const dryRun = process.argv.includes("--dry-run");

const field = (body, name) => body.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1]?.trim();
const unquote = (s) => s?.replace(/^["']|["']$/g, "") ?? "";

const normalise = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/*
 * Catalogues spell initials out, so "J. L. Carr" has to match "James Lloyd
 * Carr". Surname plus compatible first initials is the loosest rule that still
 * refuses a different author with the same surname.
 */
const authorMatches = (want, got) => {
  const a = normalise(want).split(" ").filter(Boolean);
  const b = normalise(got).split(" ").filter(Boolean);
  if (!a.length || !b.length) return false;
  if (a.join(" ") === b.join(" ")) return true;
  if (a.at(-1) !== b.at(-1)) return false;
  const initials = (parts) => parts.slice(0, -1).map((w) => w[0]).join("");
  const ia = initials(a);
  const ib = initials(b);
  return ia === ib || ia.startsWith(ib) || ib.startsWith(ia);
};

/*
 * Open Library lists reissues and translations alongside the work, so prefer a
 * candidate whose title and author actually match and whose publication year is
 * closest to ours — a 2010 reissue usually carries a different page count from
 * the first edition.
 */
const score = (doc, want) => {
  const title = normalise(doc.title ?? "");
  let s = 0;

  // Our titles carry the subtitle; the catalogue's often do not.
  const titles = [normalise(want.title), normalise(want.shortTitle)];
  if (titles.includes(title)) s += 100;
  else if (titles.some((t) => title.startsWith(t) || t.startsWith(title))) s += 60;
  else return -1;

  const authors = doc.author_name ?? [];
  if (want.authors.some((a) => authors.some((b) => authorMatches(a, b)))) s += 50;
  else return -1;

  if (doc.first_publish_year && want.year) {
    s += Math.max(0, 40 - Math.abs(doc.first_publish_year - want.year));
  }
  return s;
};

const search = async (title, author) => {
  const url = new URL(API);
  url.searchParams.set("title", title);
  url.searchParams.set("author", author);
  url.searchParams.set("fields", "title,author_name,first_publish_year,number_of_pages_median");
  url.searchParams.set("limit", "10");

  const res = await fetch(url, {
    headers: { "User-Agent": "gordonblasco.com library page-count script" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()).docs ?? [];
};

const lookup = async (want) => {
  // A full title with its subtitle often returns nothing, so ask twice.
  const docs = await search(want.title, want.authors[0]);
  if (want.shortTitle !== want.title) {
    await new Promise((r) => setTimeout(r, 300));
    docs.push(...(await search(want.shortTitle, want.authors[0])));
  }

  const best = docs
    .filter((d) => Number.isInteger(d.number_of_pages_median))
    .map((d) => ({ doc: d, s: score(d, want) }))
    .filter((c) => c.s > 0)
    .sort((a, b) => b.s - a.s)[0];

  if (!best) return null;
  const pages = best.doc.number_of_pages_median;
  // The API is someone else's data: take a plausible integer or nothing.
  if (pages < MIN_PAGES || pages > MAX_PAGES) return null;
  return { pages, matched: best.doc.title, year: best.doc.first_publish_year };
};

const files = (await readdir(LIBRARY)).filter((f) => /\.mdx?$/.test(f)).sort();
let written = 0;

for (const file of files) {
  const full = path.join(LIBRARY, file);
  const source = await readFile(full, "utf8");
  const end = source.indexOf("\n---", 3);
  const head = source.slice(0, end);

  if (!refresh && /^pages:/m.test(head)) {
    console.log(`${file.padEnd(44)} skip (has pages)`);
    continue;
  }

  const want = {
    title: unquote(field(head, "title")),
    authors: JSON.parse(field(head, "authors") ?? "[]".replace(/'/g, '"')),
    year: Number(unquote(field(head, "publicationDate") ?? "").match(/\d{4}/)?.[0]),
  };
  want.shortTitle = want.title.split(":")[0].trim();

  let found = null;
  try {
    found = await lookup(want);
  } catch (error) {
    console.log(`${file.padEnd(44)} ERROR ${error.message}`);
    continue;
  }

  if (!found) {
    console.log(`${file.padEnd(44)} no confident match`);
    continue;
  }

  console.log(
    `${file.padEnd(44)} ${String(found.pages).padStart(4)}pp  (${found.matched}, ${found.year})`,
  );

  if (dryRun) continue;

  const line = `pages: ${found.pages}`;
  const next = /^pages:/m.test(head)
    ? source.replace(/^pages:.*$/m, line)
    : source.replace(/^(category:.*)$/m, `$1\n${line}`);
  await writeFile(full, next);
  written += 1;

  // Be a polite client; this is a free service with no key.
  await new Promise((r) => setTimeout(r, 400));
}

console.log(`\n${written} file(s) updated${dryRun ? " (dry run: none)" : ""}.`);
