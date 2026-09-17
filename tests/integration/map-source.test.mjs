import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const source = readFileSync(resolve(root, "app/insights/KazakhstanRegionMap.tsx"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(root, "platform-manifest.json"), "utf8"));
const regions = JSON.parse(readFileSync(resolve(root, "regions.json"), "utf8"));

test("Next.js map uses the versioned local geometry instead of a runtime GeoJSON request", () => {
  assert.match(source, /import geometrySource from ["']\.\.\/\.\.\/regions\.json["']/);
  assert.doesNotMatch(source, /raw\.githubusercontent\.com/);
  assert.doesNotMatch(source, /fetch\s*\(\s*SOURCE_URL/);
});

test("manifest geography contract matches the checked-in map asset", () => {
  assert.equal(manifest.geography.local_asset, "regions.json");
  assert.equal(manifest.geography.territories, regions.length);

  const mappedCodes = new Set([...source.matchAll(/\b(KZ\d{2}):/g)].map((match) => match[1]));
  const geometryCodes = new Set(regions.map((region) => region.pcode));
  assert.deepEqual(mappedCodes, geometryCodes);
});
