# Atlas test layers

The repository uses dependency-free Node.js tests so the core contracts can be checked without adding another test framework.

- `unit/` — deterministic data and domain-shape checks.
- `integration/` — contracts between checked-in assets, manifest and Next.js source.
- `e2e/` — production static-export smoke checks. `npm run test:e2e` builds the Next.js export first and then verifies critical routes/assets.

Commands:

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run verify
```

The current e2e layer is a build/export smoke suite, not browser automation. Browser-level interaction tests can be added later when a browser test dependency is intentionally introduced and locked.
