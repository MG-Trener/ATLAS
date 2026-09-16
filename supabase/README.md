# AMR Atlas — Supabase

Project ref: `huhagixwkssdxigfiudk`

This directory documents the database model used by the AMR Atlas prototype. The live project is managed through versioned Supabase migrations.

## Applied migrations

1. `20260916085320_baseline_amr_reference_catalog`
2. `20260916085440_prefer_enriched_organism_titles`
3. `20260916085518_expand_structured_reference_descriptions`
4. `20260916090535_add_amr_mechanism_tables`
5. `20260916090621_add_amr_context_views`
6. `20260916091125_add_mechanism_antimicrobial_catalog`
7. `20260916091831_create_surveillance_core_schema`
8. `20260916091850_explicitly_deny_public_surveillance_access`

## Reference layer

### `reference_versions`
Tracks the exact external reference snapshot used by Atlas. Current WHONET/AMRIE data are pinned to commit `aa499717e06cba3f8b6f130544bea59db07a7805` from 2026-09-15.

### `whonet_organisms`
Versioned raw WHONET organism resource rows.

### `whonet_antimicrobials`
Versioned raw WHONET antimicrobial resource rows.

### `organism_profiles`
Atlas multilingual clinical enrichment for priority organisms.

### `antimicrobial_profiles`
Atlas multilingual enrichment for priority antimicrobial agents.

### Read-only catalog views
- `organism_catalog`
- `antimicrobial_catalog`

The browser can read these through RLS using the public publishable key. Browser write access is not allowed.

## AMR knowledge layer

### `resistance_mechanisms`
Multilingual descriptions of AMR mechanisms, genetic markers and affected drug classes.

Initial mechanism set includes:
- ESBL
- AmpC
- KPC
- NDM
- OXA-48-like carbapenemase
- Acinetobacter OXA carbapenemases
- MRSA / mec-mediated resistance
- VRE / van-mediated resistance
- fluoroquinolone target alteration
- mcr-mediated colistin resistance
- porin loss / efflux

### `organism_resistance_mechanisms`
Links WHONET organism codes to relevant AMR mechanisms with relevance level and multilingual notes.

### `organism_antimicrobial_links`
Organism-level AMR surveillance context for selected antimicrobial agents.

### `mechanism_antimicrobial_links`
Mechanism-specific laboratory/phenotypic markers. These links are for surveillance and interpretation context and are **not treatment recommendations**.

### Read-only context views
- `organism_amr_context`
- `organism_antimicrobial_context`
- `resistance_mechanism_catalog`

## Surveillance core

The following tables are intentionally empty until real laboratory data are connected.

### `surveillance_regions`
20 current Kazakhstan administrative units used by Atlas: 17 regions and 3 cities of republican significance.

### `laboratories`
Participating laboratories and their region/source configuration.

### `import_batches`
One record per WHONET/LIS/manual/API ingestion batch. Stores source fingerprint, reference version, validation status and row counters.

### `isolates`
Pseudonymized microbiology isolate records.

Important rule: **do not store raw patient identifiers**. `patient_hash` is intended only for irreversible/pseudonymized deduplication.

### `ast_results`
AST results linked to an isolate. Stores raw/numeric result, S/I/R interpretation, test method and breakpoint provenance (`standard`, `year`, `version`).

### `data_quality_issues`
Validation findings produced during ingestion at batch or isolate level.

## Intended data flow

```text
WHONET / LIS / API / manual import
              ↓
        import_batches
              ↓
       validation / mapping
              ↓
           isolates
              ↓
          ast_results
              ↓
   deduplication + quality rules
              ↓
       aggregated AMR views
              ↓
  Atlas map / analytics / signals
```

## Access model

Public browser access (`anon`, `authenticated`) is limited to safe reference data and the public region dictionary.

Patient-level / laboratory-level surveillance tables have RLS enabled and explicit deny policies for public roles:
- `laboratories`
- `import_batches`
- `isolates`
- `ast_results`
- `data_quality_issues`

Server-side ingestion will use a privileged backend/service role. The service role must never be embedded in frontend code.

## Next database steps

1. Define specimen/material dictionary and normalization aliases.
2. Define facility/laboratory onboarding model.
3. Implement WHONET staging/import functions.
4. Implement first-isolate deduplication rules.
5. Add breakpoint provenance and interpretation pipeline.
6. Create safe aggregate views for region × organism × antimicrobial × period.
7. Feed those aggregates into the Kazakhstan map and AMR Radar.
