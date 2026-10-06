import test from 'node:test';
import assert from 'node:assert/strict';
import { createWordTable } from './word.js';
import { calculate } from './physics.js';
test('Fresnel energy conservation and limiting cases', () => {
  assert.ok(Math.abs(calculate(0,1,1.5).reflectance - .04) < 1e-12);
  assert.equal(calculate(65,1.5,1.5).reflectance,0);
  assert.equal(calculate(50,1.5,1).reflectance,1);
  for (let angle=0; angle<90; angle++) {
    const r=calculate(angle,1,1.5);
    assert.ok(r.reflectance >= 0 && r.reflectance <= 1);
    assert.equal(r.reflectance+r.transmittance,1);
  }
});
test('Word export contains OOXML table and escaped Ukrainian text', async () => {
  const blob=createWordTable(['№','R, %'],[['1','4 & <5>']]);
  const bytes=new Uint8Array(await blob.arrayBuffer());
  assert.equal(new DataView(bytes.buffer).getUint32(0,true),0x04034b50);
  const text=new TextDecoder().decode(bytes);
  assert.ok(text.includes('word/document.xml'));
  assert.ok(text.includes('4 &amp; &lt;5&gt;'));
  assert.ok(text.includes('<w:tbl>'));
});
