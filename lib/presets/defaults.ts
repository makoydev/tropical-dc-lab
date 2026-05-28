import type { SimulationInputs } from "@/lib/types";

export const defaultInputs: SimulationInputs = {
  itLoadKw: 1000,
  itUtilizationPercent: 65,
  rackDensityKw: 8,
  coolingType: "air_cooling",
  chillerCop: 5.5,
  supplyAirTempC: 24,
  returnAirTempC: 35,
  fanPowerFactor: 0.08,
  pumpPowerFactor: 0.04,
  climatePreset: "singapore_typical_tropical_day",
  wetBulbTempC: 27,
  heatRejectionType: "water_cooled_cooling_tower",
  redundancyLevel: "N+1",
  gridEmissionsFactorKgCo2ePerKwh: 0.416,
  operatingHoursPerYear: 8760,
};
