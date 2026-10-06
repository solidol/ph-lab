export function calculate(angle, n1, n2) {
  if (![angle, n1, n2].every(Number.isFinite) || angle < 0 || angle >= 90 || n1 < 1 || n1 > 3 || n2 < 1 || n2 > 3) throw new RangeError('Некоректні параметри досліду');
  const rad = Math.PI / 180;
  const sinA = Math.sin(angle * rad);
  const transmitted = n1 / n2 * sinA;
  const tir = transmitted > 1 + 1e-12;
  const beta = tir ? null : Math.asin(Math.min(1, transmitted)) / rad;
  const sinB = beta === null ? null : Math.sin(beta * rad);
  return { angle, n1, n2, reflection: angle, beta, sinA, sinB, measuredRatio: sinB === null || sinB === 0 ? null : sinA / sinB, ratio: n2 / n1, critical: n1 > n2 ? Math.asin(n2 / n1) / rad : null, tir };
}
