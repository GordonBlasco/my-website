/*
 * Shared geometry for the Library's plots.
 *
 * x is a percentage so the charts stay fluid without a viewBox (a viewBox would
 * scale the type down with the chart); y is left to each chart in CSS pixels.
 *
 * The padding is shared so stacked charts line up down the page even when they
 * are on different axes. Any chart that does put publication year on x should
 * use `yearScale` rather than its own domain, so a book sits in the same place
 * in each and the set reads as one figure you can scan down.
 */

/* Room on the left for the y-axis labels, and on the right for the last tick. */
export const PAD_L = 10;
export const PAD_R = 4;

export interface PlotBook {
  title: string;
  href: string;
  authors: string[];
  year: number;
  category: "fiction" | "nonfiction";
  pages?: number;
  /** Every date the book was finished on; a re-read adds another. */
  finished: Date[];
}

export interface YearScale {
  min: number;
  max: number;
  ticks: number[];
  /** A percentage string, ready for an SVG `x`/`cx` attribute. */
  x: (year: number) => string;
}

/** The step sizes a reader recognises on a year axis. */
const YEAR_STEPS = [5, 10, 20, 25, 50, 100];

export function yearScale(years: number[]): YearScale {
  /* An empty or single-year library would give a zero-width domain. */
  const rawMin = years.length ? Math.min(...years) : 2000;
  const rawMax = years.length ? Math.max(...years) : 2020;

  const step = YEAR_STEPS.find((s) => (rawMax - rawMin) / s <= 7) ?? 100;
  const min = Math.floor(rawMin / step) * step;
  const max = Math.ceil((rawMax + 1) / step) * step;

  const ticks: number[] = [];
  for (let y = min; y <= max; y += step) ticks.push(y);

  return {
    min,
    max,
    ticks,
    x: (year) =>
      `${(PAD_L + ((year - min) / (max - min)) * (100 - PAD_L - PAD_R)).toFixed(2)}%`,
  };
}

/** Round numbers for a count axis that always starts at zero. */
const COUNT_STEPS = [10, 20, 25, 50, 100, 200, 250, 500, 1000];

export function countTicks(maxValue: number, maxIntervals = 4): number[] {
  const step = COUNT_STEPS.find((s) => maxValue / s <= maxIntervals) ?? 1000;
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface MonthBand {
  key: string;
  year: number;
  /** 0-11. */
  month: number;
  /** Months since year 0, for comparing against `monthOrdinal(new Date())`. */
  ordinal: number;
  label: string;
  /** "June 2026", for tooltips and the table. */
  full: string;
}

export interface MonthScale {
  months: MonthBand[];
  /** Band width, as a percentage string. */
  width: string;
  /** Left edge of band `i`, as a percentage string. */
  edge: (i: number) => string;
  /** Centre of band `i`, as a percentage string. */
  centre: (i: number) => string;
}

/**
 * Months since year 0, in UTC. Frontmatter dates parse to UTC midnight, so
 * reading `getMonth()` west of Greenwich would file the 1st of a month under
 * the month before it.
 */
export const monthOrdinal = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

/**
 * "Sep 2026", for the data table's narrow column. UTC for the same reason as
 * `monthOrdinal`. The tooltips use the full month name instead, via
 * `MonthBand.full`, where there is room for it.
 */
export const monthLabel = (date: Date) =>
  `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

/**
 * Months as equal bands rather than points on a continuous axis, because the
 * cumulative chart is drawn out of rects: SVG path and polygon coordinates do
 * not accept percentages, so a fluid chart has to be built from `x`/`width`.
 *
 * The axis runs whole calendar years — January of the first to December of the
 * last — so the months keep the spacing a reader already knows and a quiet
 * stretch is visible as a quiet stretch. Empty months are kept for the same
 * reason: a month with nothing finished is a fact about the reading, not a gap
 * to close. Whether a band gets *drawn* is the caller's business; months that
 * have not happened yet are axis only.
 */
export function monthScale(dates: Date[]): MonthScale {
  const indices = dates.map(monthOrdinal);
  const anchor = indices.length ? Math.min(...indices) : monthOrdinal(new Date());
  const latest = indices.length ? Math.max(...indices) : anchor;
  const first = Math.floor(anchor / 12) * 12;
  const last = Math.floor(latest / 12) * 12 + 11;

  const months: MonthBand[] = [];
  for (let i = first; i <= last; i += 1) {
    const year = Math.floor(i / 12);
    const month = i % 12;
    months.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      year,
      month,
      ordinal: i,
      label: MONTH_NAMES[month],
      full: `${MONTH_FULL[month]} ${year}`,
    });
  }

  const width = (100 - PAD_L - PAD_R) / months.length;

  return {
    months,
    width: `${width.toFixed(3)}%`,
    edge: (i) => `${(PAD_L + i * width).toFixed(3)}%`,
    centre: (i) => `${(PAD_L + (i + 0.5) * width).toFixed(3)}%`,
  };
}
