# Public Atlas review — 20 September 2026

The public entry point (`index.html`) is now the Kazakhstan map explorer. The prior clinical concept is preserved at `clinical-preview.html`. The Next.js application and the other legacy concepts remain separate prototypes; their migration has not been completed.

## Implemented

- Versioned local boundaries for all 20 territories; no external map, font or analytics requests on the new entry page.
- A complete region view with fitted territory geometry, national locator, S/I/R distribution, national comparison, antimicrobial table, specimen breakdown, annual trend, N and Wilson intervals.
- One pure model module (`atlas-model.mjs`) for all values and exports; national counts sum region counts, and S + I + R equals N. The module can be imported by a future component frontend without duplicating formulas.
- Explicit synthetic-fixture labelling; generated figures do not describe Kazakhstan epidemiology. No invented official data, district-level results or molecular confirmations. The label “laboratories” explicitly describes model participants.
- Consistent project threshold N >= 30. Below it, the public output and CSV contain no numerator, N, proportion or CI; the interface displays “<30”. This statistical precision policy is not a legal definition of de-identification.
- Explicit 2026 YTD cutoff (20 September), no full-year comparisons disguised as measured trends. EUCAST terminology for I, without claiming that breakpoints were applied to synthetic observations.
- Native labelled filters, keyboard map selection, reduced-motion styles, search, browser Back/Forward and direct region URLs; Russian, Kazakh and English.
- A self-only Content Security Policy and no-referrer policy for the public explorer; no patient upload, identifiers, geolocation requests or authentication. Only language preference is persisted locally. Hosting request logs are outside client control.
- A local-only public aggregate CSV exporter with provenance and spreadsheet formula escaping.

## Kazakhstan legal basis actually checked

The current texts were read on Adilet on 20 September 2026, including the displayed 2026 amendments:

- [Law on Personal Data and Their Protection](https://adilet.zan.kz/rus/docs/Z1300000094): articles 7 (lawful conditions, purpose and minimisation), 12 (storage in Kazakhstan), 17 (de-identification in research). Transborder processing must separately be assessed under article 16.
- [Health Code](https://adilet.zan.kz/rus/docs/K2000000360): article 273 protects personal medical information and sets the conditions for disclosure.

These are design constraints, not a certification that the project complies with every applicable rule. No consent mechanism was invented for a site that does not collect patient records. No unverified operator identity, data-residency claim or official endorsement was added.

## Required before real surveillance data

Identify the controller/operator and lawful basis, obtain required consents or establish applicable statutory exceptions, document purpose/retention/access rules and patient rights, and verify Kazakhstan hosting for personal data and relevant backups. Existing reference hosting must not be presumed suitable for patient records.

Establish server-side access control, audit, secure transmission, and a reviewed de-identification/publication pipeline. Client-side suppression is presentation only: real suppressed rows must never reach the browser, downloads or a public repository. Review complementary suppression, sparse dimensions, repeated filters and differencing; a minimum N alone cannot guarantee anonymity. Validate AST methods, standard/version, specimen definitions, denominators and deduplication before publishing any real clinical aggregate. Publish an operator-specific privacy notice only when its facts are known.

No live database tables, policies or credentials were changed by this update.

## Visual QA

`tests/responsive-preview.html` presents 390 px and 768 px frames for checking the public entry and a regional page. The normal entry contains no viewport overrides. Desktop and responsive browser checks should include country → region → home, filter changes, all three languages, sparse COL/blood samples, and Escape on the legal dialog.
