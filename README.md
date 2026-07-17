# Carbon Verifier Database

A structured database of **133 third-party carbon/GHG verification and validation bodies** (VVBs), extracted from the CarbonSig verifier directory. Each record includes firmographics, accreditations, standards coverage, program registrations, a generated plain-English summary, and a data-confidence estimate.

## Files

| File | Description |
|---|---|
| [`data/verifiers.json`](data/verifiers.json) | Full records with per-record summary and confidence breakdown |
| [`data/verifiers.csv`](data/verifiers.csv) | Flattened one-row-per-verifier export (arrays joined with `; `) |
| [`stats.json`](stats.json) | Dataset-level statistics (counts by confidence level and country) |

## Dataset at a glance

- **Records:** 133 verification bodies across 36 countries
- **Top countries:** United States (20), India (12), Germany (11), United Kingdom (10), China (9)
- **Average confidence score:** 0.51
- **Confidence distribution:** 23 high · 37 medium · 73 low
- **Data as of:** 2026-02-24 (per-record `lastUpdated` field)

The skew toward *low* confidence reflects that many records for regional subsidiaries (e.g. SGS India, DNV India) carry only program-registration data with no direct contact, founding year, or size information — the records are accurate as far as they go, but thin.

## Record schema

| Field | Type | Notes |
|---|---|---|
| `id` | number | Stable ID from the source directory |
| `name` / `legalName` | string | Display and registered entity names |
| `website`, `headquarters`, `country`, `yearFounded` | | Firmographics (`yearFounded` may be null) |
| `contactEmail`, `contactPhone`, `keyContactName`, `keyContactTitle` | string | Business contact info from public sources; may be empty |
| `accreditations` | string[] | Accrediting bodies (ANAB, UKAS, CARB, etc.) |
| `standards` | string[] | Standards verified against (ISO 14064/14065, VCS, Gold Standard, CARB, etc.) |
| `programs` | string[] | Program registrations (Verra VCS, Gold Standard, CAR, ACR, ISCC, RSB, etc.) |
| `regions` | string[] | Geographic service coverage |
| `employeeRange` | string | Approximate size band; may be empty |
| `description` | string | Original directory description |
| `summary` | string | **Generated** plain-English one-paragraph summary |
| `confidence` | object | **Generated** confidence estimate (see below) |
| `sourceUrls` | string[] | Public sources the record was compiled from |
| `lastUpdated` | string | ISO date of last source refresh |

## Confidence methodology (`field-completeness-v1`)

The confidence score estimates **how well-evidenced and complete each record is** — it is *not* a judgment of the verifier's quality or credibility. It is a weighted field-completeness score in [0, 1]:

| Component | Weight | Full credit when |
|---|---|---|
| Accreditations | 0.20 | ≥ 2 accrediting bodies listed |
| Contact info | 0.15 | Both email and phone present |
| Firmographics | 0.15 | Founding year + size band + HQ all present |
| Source URLs | 0.15 | ≥ 2 independent public sources |
| Standards coverage | 0.10 | ≥ 3 standards listed |
| Named key contact | 0.10 | Contact name + title present |
| Program registrations | 0.10 | ≥ 2 program registrations |
| Distinct legal name | 0.05 | Legal name differs from display name (evidence of entity-level research) |

**Levels:** `high` ≥ 0.75 · `medium` ≥ 0.50 · `low` < 0.50

Each record's `confidence.components` array shows the per-component weight, earned score, and a human-readable note, so scores are fully auditable and the rubric can be re-weighted downstream.

### Known limitations

- Scores measure record completeness, not verifier legitimacy — a thin record for DNV is still DNV.
- Accreditation and program lists were compiled from public sources at a point in time (2026-02-24); accreditation status changes and should be re-verified against accreditor registries (ANAB, UKAS, CARB, Verra, Gold Standard) before load-bearing use.
- Contact details are business contacts from public websites and may go stale.

## Provenance

Extracted from the CarbonSig frontend verifier directory (`src/data/verifiers.ts`). Summaries and confidence scores generated programmatically at extraction time; the generator logic is deterministic and versioned as `field-completeness-v1`.
