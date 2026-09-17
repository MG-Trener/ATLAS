import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const regions = JSON.parse(readFileSync(resolve(root, "regions.json"), "utf8"));

const expectedPcodes = new Set([
  "KZ10", "KZ11", "KZ15", "KZ19", "KZ23", "KZ27", "KZ31", "KZ33", "KZ35", "KZ39",
  "KZ43", "KZ47", "KZ55", "KZ59", "KZ61", "KZ62", "KZ63", "KZ71", "KZ75", "KZ79",
]);

test("local Kazakhstan geometry contains exactly 20 current Atlas territories", () => {
  assert.equal(Array.isArray(regions), true);
  assert.equal(regions.length, 20);
  assert.deepEqual(new Set(regions.map((region) => region.pcode)), expectedPcodes);
});

test("every local map territory has renderable SVG geometry and label coordinates", () => {
  for (const region of regions) {
    assert.match(region.pcode, /^KZ\d{2}$/);
    assert.equal(typeof region.path, "string");
    assert.ok(region.path.startsWith("M "), `${region.pcode} must have an SVG path`);
    assert.equal(Number.isFinite(region.cx), true, `${region.pcode} cx must be finite`);
    assert.equal(Number.isFinite(region.cy), true, `${region.pcode} cy must be finite`);
  }
});
