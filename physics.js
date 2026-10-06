export function calculate(angle, n1, n2) {
  if (![angle, n1, n2].every(Number.isFinite) || angle < 0 || angle >= 90 || n1 < 1 || n1 > 3 || n2 < 1 || n2 > 3) throw new RangeError('Некоректні параметри досліду');
  const rad = Math.PI / 180;
  const sinA = Math.sin(angle * rad);
  const transmitted = n1 / n2 * sinA;
  const tir = transmitted > 1 + 1e-12;
  const beta = tir ? null : Math.asin(Math.min(1, transmitted)) / rad;
  const sinB = beta === null ? null : Math.sin(beta * rad);
  const cosA = Math.cos(angle * rad), cosB = beta === null ? 0 : Math.cos(beta * rad);
  const rs = ((n1*cosA - n2*cosB) / (n1*cosA + n2*cosB)) ** 2;
  const rp = ((n2*cosA - n1*cosB) / (n2*cosA + n1*cosB)) ** 2;
  const reflectance = n1 === n2 ? 0 : tir ? 1 : Math.min(1, (rs + rp) / 2);
  return { angle, n1, n2, reflection: angle, beta, sinA, sinB, reflectance, transmittance: 1 - reflectance, measuredRatio: sinB === null || sinB === 0 ? null : sinA / sinB, ratio: n2 / n1, critical: n1 > n2 ? Math.asin(n2 / n1) / rad : null, tir };
}
