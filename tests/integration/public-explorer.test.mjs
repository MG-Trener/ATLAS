import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MIN_N} from '../../atlas-model.mjs';
const html=readFileSync(new URL('../../index.html',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../../platform-manifest.json',import.meta.url),'utf8'));
test('public explorer restricts the external basemap and cannot send patient data',()=>{
  assert.match(html,/connect-src 'self'/);
  assert.match(html,/img-src 'self' data: https:\/\/tile\.openstreetmap\.org/);
  assert.match(html,/form-action 'none'/);
  assert.match(html,/name="referrer" content="strict-origin-when-cross-origin"/);
  assert.doesNotMatch(html,/<(?:script|link)\b[^>]+(?:src|href)="https?:/);
  assert.doesNotMatch(html,/<input[^>]+type="file"/);
});
test('manifest publication threshold and public model agree',()=>{
  assert.equal(manifest.surveillance.publication_policy.show_percentage_min_n,MIN_N);
  assert.equal(manifest.public_explorer.personal_data_upload,false);
  assert.equal(manifest.public_explorer.data_mode,'synthetic_demo');
});
