import type { ClimatePreset, CoolingType, HeatRejectionType, RedundancyLevel } from "@/lib/types";

export const coolingTypeLabels: Record<CoolingType, string> = {
  air_cooling: "Air Cooling",
  optimized_air_cooling: "Optimized Air Cooling",
  rear_door_heat_exchanger: "Rear-Door Heat Exchanger",
  direct_to_chip_liquid_cooling: "Direct-to-Chip Liquid Cooling",
};

export const climatePresetLabels: Record<ClimatePreset, string> = {
  rainy_lower_ambient_day: "Rainy Lower Ambient Day",
  singapore_typical_tropical_day: "Singapore Typical Tropical Day",
  hot_humid_peak_day: "Hot/Humid Peak Day",
};

export const heatRejectionLabels: Record<HeatRejectionType, string> = {
  water_cooled_cooling_tower: "Water-Cooled Cooling Tower",
  air_cooled_chiller: "Air-Cooled Chiller",
  hybrid_cooling: "Hybrid Cooling",
};

export const redundancyLabels: Record<RedundancyLevel, string> = {
  N: "N",
  "N+1": "N+1",
  "2N": "2N",
};

export const rackDensityOptions = [4, 8, 15, 30, 50];
