const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export function perSecondWadToApyPct(rateWad: bigint): number {
  const ratePerSecond = Number(rateWad) / 1e18;
  if (!Number.isFinite(ratePerSecond) || ratePerSecond < 0) return 0;
  return Math.expm1(SECONDS_PER_YEAR * Math.log1p(ratePerSecond)) * 100;
}

export function annualRayToApyPct(rateRay: bigint): number {
  const annualRate = Number(rateRay) / 1e27;
  if (!Number.isFinite(annualRate) || annualRate < 0) return 0;
  const perSecond = annualRate / SECONDS_PER_YEAR;
  return Math.expm1(SECONDS_PER_YEAR * Math.log1p(perSecond)) * 100;
}
