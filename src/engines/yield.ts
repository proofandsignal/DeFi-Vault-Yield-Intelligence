import type {
  YieldSimulation,
  YieldSimulationInput
} from "../domain/types.js";

function assertRate(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1.`);
  }
}

export function simulateAnnualYield(input: YieldSimulationInput): YieldSimulation {
  if (!Number.isFinite(input.principalUsd) || input.principalUsd < 0) {
    throw new RangeError("principalUsd must be a non-negative finite number.");
  }

  if (!Number.isFinite(input.grossApyPct)) {
    throw new RangeError("grossApyPct must be finite.");
  }

  assertRate("performanceFeeRate", input.feeModel.performanceFeeRate);
  assertRate("platformShareRate", input.feeModel.platformShareRate);

  const rewardsApyPct = input.rewardsApyPct ?? 0;
  const grossApyPct = input.grossApyPct + rewardsApyPct;
  const grossYieldUsd = input.principalUsd * (grossApyPct / 100);

  // Performance fees apply to positive yield only.
  const totalPerformanceFeeUsd =
    Math.max(0, grossYieldUsd) * input.feeModel.performanceFeeRate;

  const platformFeeShareUsd =
    totalPerformanceFeeUsd * input.feeModel.platformShareRate;
  const managerFeeShareUsd =
    totalPerformanceFeeUsd - platformFeeShareUsd;

  const operatingCostUsd = Math.max(0, input.annualOperatingCostUsd ?? 0);
  const userNetYieldUsd =
    grossYieldUsd - totalPerformanceFeeUsd - operatingCostUsd;

  const userNetApyPct =
    input.principalUsd === 0
      ? 0
      : (userNetYieldUsd / input.principalUsd) * 100;

  return {
    grossYieldUsd,
    totalPerformanceFeeUsd,
    platformFeeShareUsd,
    managerFeeShareUsd,
    operatingCostUsd,
    userNetYieldUsd,
    userNetApyPct
  };
}
