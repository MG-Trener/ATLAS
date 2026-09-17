import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const out = resolve(root, "out");

const requiredPages = [
  "index.html",
  "overview/index.html",
  "insights/index.html",
  "reference/index.html",
  "whonet/index.html",
  "surveillance/index.html",
  "quality/index.html",
  "regions/astana/index.html",
];

test("production static export contains the critical Atlas routes", () => {
  assert.ok(existsSync(out), "out/ is missing: run the production build before the e2e smoke test");
  for (const page of requiredPages) {
    assert.ok(existsSync(resolve(out, page)), `missing exported route: ${page}`);
  }
});

test("exported insights page is generated without an external GeoJSON URL", () => {
  const pagePath = resolve(out, "insights/index.html");
  assert.ok(existsSync(pagePath), "insights export is missing");
  const html = readFileSync(pagePath, "utf8");
  assert.doesNotMatch(html, /raw\.githubusercontent\.com\/galymorg\/new_qazaqstan_GeoJSON/);
});
