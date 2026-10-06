import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from './physics.js';
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-9, `${a} ≠ ${b}`);
test('Кути понад 89° до 89,9°: скінченні результати та баланс енергії', () => {
  for (const angle of [89.1, 89.5, 89.9]) {
    const r = calculate(angle, 1, 1.5);
    near(r.reflection, angle);
    near(r.n1 * r.sinA, r.n2 * r.sinB);
    assert.ok(Number.isFinite(r.beta));
    assert.ok(r.reflectance >= 0 && r.reflectance <= 1);
    near(r.reflectance + r.transmittance, 1);
    assert.equal(calculate(angle, 1.5, 1).tir, true);
  }
});
test('Повітря → скло: закон Снеліуса та відбиття', () => { const r=calculate(40,1,1.5); near(r.reflection,40); near(r.beta,25.373993939179407); near(r.n1*r.sinA,r.n2*r.sinB); near(r.measuredRatio,1.5); });
test('Нормальне падіння: відношення синусів не визначене', () => { const r=calculate(0,1,1.5); assert.equal(r.beta,0); assert.equal(r.measuredRatio,null); });
test('Однакові середовища не змінюють напрямок', () => near(calculate(65,1.333,1.333).beta,65));
test('Критичний кут та повне внутрішнє відбиття', () => { const critical=Math.asin(1/1.5)*180/Math.PI; const boundary=calculate(critical,1.5,1); near(boundary.beta,90); assert.equal(boundary.tir,false); const r=calculate(50,1.5,1); assert.equal(r.tir,true); assert.equal(r.beta,null); assert.equal(r.measuredRatio,null); near(r.critical,critical); });
test('Обернений хід променя', () => { const forward=calculate(40,1,1.5); near(calculate(forward.beta,1.5,1).beta,40); });
test('Некоректні параметри відхиляються', () => { for (const args of [[90,1,1.5],[-1,1,1.5],[30,0,1],[NaN,1,1],[30,1,4]]) assert.throws(() => calculate(...args),RangeError); });
