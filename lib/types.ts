export type CoolingType =
  | "air_cooling"
  | "optimized_air_cooling"
  | "rear_door_heat_exchanger"
  | "direct_to_chip_liquid_cooling";

export type ClimatePreset =
  | "rainy_lower_ambient_day"
  | "singapore_typical_tropical_day"
  | "hot_humid_peak_day";

export type HeatRejectionType =
  | "water_cooled_cooling_tower"
  | "air_cooled_chiller"
  | "hybrid_cooling";

export type RedundancyLevel = "N" | "N+1" | "2N";

export interface SimulationInputs {
  itLoadKw: number;
  itUtilizationPercent: number;
  rackDensityKw: number;
  coolingType: CoolingType;
  chillerCop: number;
  supplyAirTempC: number;
  returnAirTempC: number;
  fanPowerFactor: number;
  pumpPowerFactor: number;
  climatePreset: ClimatePreset;
  wetBulbTempC: number;
  heatRejectionType: HeatRejectionType;
  redundancyLevel: RedundancyLevel;
  gridEmissionsFactorKgCo2ePerKwh: number;
  operatingHoursPerYear: number;
}

export interface SimulationOutputs {
  itPowerKw: number;
  coolingPowerKw: number;
  fanPowerKw: number;
  pumpPowerKw: number;
  otherFacilityPowerKw: number;
  totalFacilityPowerKw: number;
  pue: number;
  annualEnergyKwh: number;
  annualCarbonKgCo2e: number;
  annualCarbonTonnesCo2e: number;
  annualWaterLitres: number;
  wueLitresPerKwh: number;
}

export interface ScenarioPreset {
  name: string;
  description: string;
  inputs: SimulationInputs;
}

export interface Recommendation {
  title: string;
  why: string;
  impact: "Low" | "Medium" | "High";
  difficulty: "Low" | "Medium" | "High";
  metrics: string[];
}
