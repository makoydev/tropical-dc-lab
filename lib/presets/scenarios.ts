import { defaultInputs } from "@/lib/presets/defaults";
import type { ScenarioPreset } from "@/lib/types";

export const scenarioPresets: ScenarioPreset[] = [
  {
    name: "Baseline Air Cooling",
    description: "Conventional tropical facility with air cooling and moderate chiller performance.",
    inputs: {
      ...defaultInputs,
      coolingType: "air_cooling",
      chillerCop: 4.8,
      supplyAirTempC: 22,
      fanPowerFactor: 0.1,
      pumpPowerFactor: 0.04,
    },
  },
  {
    name: "Optimized Tropical Air Cooling",
    description: "Improved airflow management, warmer supply air, and higher-efficiency chilled water plant.",
    inputs: {
      ...defaultInputs,
      coolingType: "optimized_air_cooling",
      chillerCop: 6.2,
      supplyAirTempC: 26,
      fanPowerFactor: 0.07,
      pumpPowerFactor: 0.035,
    },
  },
  {
    name: "Liquid Cooling Assisted",
    description: "Direct-to-chip liquid cooling reduces fan load while increasing pumping demand.",
    inputs: {
      ...defaultInputs,
      coolingType: "direct_to_chip_liquid_cooling",
      chillerCop: 6.8,
      supplyAirTempC: 28,
      fanPowerFactor: 0.04,
      pumpPowerFactor: 0.06,
      rackDensityKw: 30,
      heatRejectionType: "hybrid_cooling",
    },
  },
];
