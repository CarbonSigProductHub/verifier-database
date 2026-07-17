import { verifiers } from '/Users/nickgogerty/CarbonSigRig/services/carbon-sig-front/src/data/verifiers';
import { writeFileSync, mkdirSync } from 'fs';

const OUT = process.argv[2];
mkdirSync(`${OUT}/data`, { recursive: true });

interface Component { field: string; weight: number; earned: number; note: string }

function score(v: (typeof verifiers)[number]) {
  const c: Component[] = [];
  const add = (field: string, weight: number, frac: number, note: string) =>
    c.push({ field, weight, earned: +(weight * frac).toFixed(3), note });

  add('accreditations', 0.20, v.accreditations.length ? Math.min(v.accreditations.length / 2, 1) : 0,
    v.accreditations.length ? `${v.accreditations.length} accreditation(s) listed` : 'no accreditations listed');
  add('sourceUrls', 0.15, Math.min(v.sourceUrls.length / 2, 1),
    `${v.sourceUrls.length} source URL(s)`);
  add('standards', 0.10, v.standards.length ? Math.min(v.standards.length / 3, 1) : 0,
    `${v.standards.length} standard(s)`);
  add('contact', 0.15,
    ((v.contactEmail ? 1 : 0) + (v.contactPhone ? 1 : 0)) / 2,
    [v.contactEmail && 'email', v.contactPhone && 'phone'].filter(Boolean).join('+') || 'no direct contact info');
  add('keyContact', 0.10,
    ((v.keyContactName ? 1 : 0) + (v.keyContactTitle ? 1 : 0)) / 2,
    v.keyContactName ? `named contact: ${v.keyContactName}` : 'no named contact');
  add('firmographics', 0.15,
    ((v.yearFounded ? 1 : 0) + (v.employeeRange ? 1 : 0) + (v.headquarters ? 1 : 0)) / 3,
    [v.yearFounded && 'founded', v.employeeRange && 'size', v.headquarters && 'HQ'].filter(Boolean).join('+') || 'minimal firmographics');
  add('programs', 0.10, v.programs.length ? Math.min(v.programs.length / 2, 1) : 0,
    `${v.programs.length} program registration(s)`);
  add('legalName', 0.05, v.legalName && v.legalName !== v.name ? 1 : v.legalName ? 0.5 : 0,
    v.legalName === v.name ? 'legal name = display name (unverified distinct entity name)' : 'distinct legal name');

  const total = +c.reduce((s, x) => s + x.earned, 0).toFixed(3);
  const level = total >= 0.75 ? 'high' : total >= 0.5 ? 'medium' : 'low';
  return { total, level, components: c };
}

function summarize(v: (typeof verifiers)[number]) {
  const parts: string[] = [];
  parts.push(`${v.name}${v.legalName && v.legalName !== v.name ? ` (${v.legalName})` : ''} is a carbon/GHG verification body`);
  if (v.headquarters || v.country) parts.push(`headquartered in ${[v.headquarters, v.headquarters?.includes(v.country) ? '' : v.country].filter(Boolean).join(', ')}`);
  if (v.yearFounded) parts.push(`founded in ${v.yearFounded}`);
  let s = parts.join(', ') + '.';
  if (v.accreditations.length) s += ` Accredited by ${v.accreditations.join(', ')}.`;
  if (v.standards.length) s += ` Verifies against ${v.standards.slice(0, 6).join(', ')}${v.standards.length > 6 ? ` and ${v.standards.length - 6} more` : ''}.`;
  if (v.programs.length) s += ` Active in programs: ${v.programs.join(', ')}.`;
  s += ` Coverage: ${v.regions.length ? v.regions.join(', ') : 'unspecified'}.`;
  if (v.employeeRange) s += ` Size: ${v.employeeRange} employees.`;
  return s;
}

const enriched = verifiers.map(v => {
  const conf = score(v);
  return {
    ...v,
    summary: summarize(v),
    confidence: {
      score: conf.total,
      level: conf.level,
      method: 'field-completeness-v1',
      components: conf.components,
    },
  };
});

writeFileSync(`${OUT}/data/verifiers.json`, JSON.stringify(enriched, null, 2));

// CSV (flattened)
const esc = (s: unknown) => {
  const str = Array.isArray(s) ? s.join('; ') : String(s ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};
const cols = ['id','name','legalName','website','headquarters','country','yearFounded','contactEmail','contactPhone','keyContactName','keyContactTitle','accreditations','standards','programs','regions','employeeRange','description','summary','confidence_score','confidence_level','sourceUrls','lastUpdated'];
const rows = enriched.map(v => cols.map(c =>
  c === 'confidence_score' ? v.confidence.score :
  c === 'confidence_level' ? v.confidence.level :
  esc((v as any)[c])).join(','));
writeFileSync(`${OUT}/data/verifiers.csv`, cols.join(',') + '\n' + rows.join('\n') + '\n');

// Stats for README
const byLevel = { high: 0, medium: 0, low: 0 } as Record<string, number>;
const byCountry: Record<string, number> = {};
enriched.forEach(v => { byLevel[v.confidence.level]++; byCountry[v.country] = (byCountry[v.country] || 0) + 1; });
const avg = enriched.reduce((s, v) => s + v.confidence.score, 0) / enriched.length;
writeFileSync(`${OUT}/stats.json`, JSON.stringify({
  count: enriched.length,
  avgConfidence: +avg.toFixed(3),
  byLevel,
  byCountry: Object.fromEntries(Object.entries(byCountry).sort((a, b) => b[1] - a[1])),
}, null, 2));
console.log(`wrote ${enriched.length} records | avg confidence ${avg.toFixed(3)} | high ${byLevel.high} / med ${byLevel.medium} / low ${byLevel.low}`);
