import type {
  ClimatePreset,
  CoolingType,
  HeatRejectionType,
  RedundancyLevel,
  SimulationInputs,
  SimulationOutputs,
} from "@/lib/types";

const coolingTypeFactors: Record<CoolingType, number> = {
  air_cooling: 1,
  optimized_air_cooling: 0.85,
  rear_door_heat_exchanger: 0.75,
  direct_to_chip_liquid_cooling: 0.65,
};

const climateFactors: Record<ClimatePreset, number> = {
  rainy_lower_ambient_day: 0.95,
  singapore_typical_tropical_day: 1,
  hot_humid_peak_day: 1.08,
};

const fanModifiers: Record<CoolingType, number> = {
  air_cooling: 1,
  optimized_air_cooling: 0.8,
  rear_door_heat_exchanger: 0.65,
  direct_to_chip_liquid_cooling: 0.4,
};

const pumpModifiers: Record<CoolingType, number> = {
  air_cooling: 1,
  optimized_air_cooling: 1,
  rear_door_heat_exchanger: 1.1,
  direct_to_chip_liquid_cooling: 1.25,
};

const redundancyPenalties: Record<RedundancyLevel, number> = {
  N: 1,
  "N+1": 1.03,
  "2N": 1.08,
};

const waterFactors: Record<HeatRejectionType, number> = {
  water_cooled_cooling_tower: 1.6,
  hybrid_cooling: 0.8,
  air_cooled_chiller: 0.1,
};

const otherFacilityFactor = 0.05;

export function calculateSimulation(inputs: SimulationInputs): SimulationOutputs {
  assertPositive(inputs.itLoadKw, "IT load");
  assertPositive(inputs.chillerCop, "Chiller COP");
  assertPositive(inputs.operatingHoursPerYear, "Operating hours");

  const itPowerKw = inputs.itLoadKw;
  const wetBulbModifier = 1 + Math.max(0, inputs.wetBulbTempC - 27) * 0.015;
  const utilizationPenalty = 1 + ((100 - inputs.itUtilizationPercent) / 100) * 0.1;

  const baseCoolingPowerKw = itPowerKw / inputs.chillerCop;
  const coolingPowerKw =
    baseCoolingPowerKw *
    coolingTypeFactors[inputs.coolingType] *
    climateFactors[inputs.climatePreset] *
    wetBulbModifier *
    utilizationPenalty;

  const fanPowerKw = itPowerKw * inputs.fanPowerFactor * fanModifiers[inputs.coolingType];
  const pumpPowerKw = itPowerKw * inputs.pumpPowerFactor * pumpModifiers[inputs.coolingType];
  const otherFacilityPowerKw = itPowerKw * otherFacilityFactor;
  const facilityOverheadKw = coolingPowerKw + fanPowerKw + pumpPowerKw + otherFacilityPowerKw;
  const adjustedFacilityOverheadKw = facilityOverheadKw * redundancyPenalties[inputs.redundancyLevel];
  const totalFacilityPowerKw = itPowerKw + adjustedFacilityOverheadKw;
  const pue = totalFacilityPowerKw / itPowerKw;
  const annualEnergyKwh = totalFacilityPowerKw * inputs.operatingHoursPerYear;
  const annualCarbonKgCo2e = annualEnergyKwh * inputs.gridEmissionsFactorKgCo2ePerKwh;
  const annualCarbonTonnesCo2e = annualCarbonKgCo2e / 1000;
  const annualItEnergyKwh = itPowerKw * inputs.operatingHoursPerYear;
  const annualWaterLitres = annualItEnergyKwh * waterFactors[inputs.heatRejectionType];
  const wueLitresPerKwh = annualWaterLitres / annualItEnergyKwh;

  return {
    itPowerKw,
    coolingPowerKw,
    fanPowerKw,
    pumpPowerKw,
    otherFacilityPowerKw,
    totalFacilityPowerKw,
    pue,
    annualEnergyKwh,
    annualCarbonKgCo2e,
    annualCarbonTonnesCo2e,
    annualWaterLitres,
    wueLitresPerKwh,
  };
}

export function getWaterFactor(type: HeatRejectionType) {
  return waterFactors[type];
}

function assertPositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}
