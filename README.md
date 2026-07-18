# Carbon Verifier Database

A structured database of third-party carbon/GHG/EPD verification and validation bodies (VVBs), in two generations:

- **v2 (current): 769 entities** discovered by sweeping **~80 official accreditation and program registries** worldwide, every record proven by a hyperlink to the registry page or document where it appears, then enriched with establishment year, regions served, sectors verified, and quality proxies.
- **v1: 133 records** extracted from the CarbonSig verifier directory (kept intact; merged into v2).

## Files

| File | Description |
|---|---|
| [`data/verifiers-v2.json`](data/verifiers-v2.json) | **v2** — full records: registry proof URLs, enrichment fields, summary, auditable confidence breakdown |
| [`data/verifiers-v2.csv`](data/verifiers-v2.csv) | v2 flattened export |
| [`data/registry-sources.json`](data/registry-sources.json) | Provenance for all 121 registry-sweep attempts (proof URL, yield, failure notes) |
| [`data/excluded-non-carbon.json`](data/excluded-non-carbon.json) | 17 entities excluded after research found no carbon scope (with reasons) |
| [`data/verifiers.json`](data/verifiers.json) | v1 records with per-record summary and confidence breakdown |
| [`data/verifiers.csv`](data/verifiers.csv) | v1 flattened export |
| [`stats-v2.json`](stats-v2.json) / [`stats.json`](stats.json) | Dataset-level statistics |

## v2 at a glance

- **769 entities** (652 firms, 117 individually approved verifier practices) across **65 countries**
- **404** with a researched establishment year; average confidence **0.70** (387 high / 289 medium / 93 low)
- Top countries: United States (101), Germany (79), Australia (39), India (34), UK (34), Canada (32), Norway (32)
- Registries swept include: Verra VCS, UNFCCC CDM (incl. historical DOEs) & Article 6.4/PACM, Gold Standard, CARB (MRR + LCFS), ACR, Climate Action Reserve, ANAB, UKAS, DAkkS, ISCC, RSB, Global Carbon Council, CORSIA, The Climate Registry, Australia CER, Puro.earth, Isometric, Plan Vivo, SocialCarbon, Cercarbono, ICR, ERS, EU national accreditation bodies (BELAC, ČIA, Cofrac, ENAC, ESYD, PCA, RvA…), worldwide ISO 14065 accreditors (SCC, NABCB, ONAC, SANAS, KAN, CNAS, INACAL…), Thailand T-VER, K-ETS, China CCER, Mexico RENE/EMA, EPD programs (EPD International, IBU, EPD Norge, SmartEPD, EPD Hub, PEP ecopassport, EPDItaly, EcoLeaf…), and EU RED biofuel GHG schemes (REDcert, SURE, 2BSvs, SBP)

### Collection methodology (v2)

Three parallel swarm rounds of Haiku crawler agents (117 agents, ~2,000 page fetches) swept registries via HTTP; four JavaScript-locked registries (Gold Standard, CARB LCFS, DAkkS, SCC Canada) were extracted via headless browser, including one archived official page (Gold Standard, Wayback 2025-09-16 snapshot — the live site refuses automated connections). A fourth swarm of 95 agents then researched each unique entity for enrichment fields. Agents operated under strict no-fabrication rules: every entity must appear on a fetched page, and unknown fields are null, not guessed.

**Honest gaps (why not 1,000):** several registries are login-walled, JavaScript-only, image-PDF-only, or publish no list at all — Accredia's full EU ETS list, SWEDAC, TAF (Taiwan), EMA Mexico's full padrón, JAS-ANZ (register domain currently serving a parked/hijacked page), DEHSt's PDF list, Carbon Standards International, Riverse, Korea EPD, and the full K-ETS designation list. Details per registry in [`data/registry-sources.json`](data/registry-sources.json). The v2 count of 769 is what can currently be **proven with real hyperlinks**.

### Confidence methodology v2 (`registry-evidence-v2`)

Confidence measures **how well-evidenced the record is** — not verifier quality. Weighted components: cross-registry presence (0.30, full credit at 3+ independent registries), registry proof URL (0.10), establishment year found (0.10), website (0.05), regions served (0.10), sectors (0.10), quality proxies (0.15, full at 3+), enrichment sources (0.10). Records whose carbon scope was disputed by enrichment research carry a −0.15 penalty and a `scopeNote`. Levels: high ≥ 0.75, medium ≥ 0.50. Each record's `confidence.components` array makes the score auditable.

### v2 record schema

Key fields: `name`, `aka`, `entityType` (firm | individual-practice), `website`, `yearEstablished`, `hqCountry`/`hqCity`, `regionsServed`, `sectors`, `registries` (which official registries list it), `programs`, `registryProofUrls` (**the proof hyperlinks**), `qualityProxies` (accreditations, project counts, staff size, suspensions), `enrichmentSourceUrls`, `summary`, `confidence`, `scopeNote`, `carbonsigV1` (link to v1 record where matched).

---

## v1 (CarbonSig directory extraction)

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
