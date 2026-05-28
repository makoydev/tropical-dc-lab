import { describe, expect, it } from "vitest";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { getRecommendations } from "@/lib/calculations/recommendations";
import { defaultInputs } from "@/lib/presets/defaults";

describe("calculateSimulation", () => {
  it("calculates PUE and annual energy from the default inputs", () => {
    const outputs = calculateSimulation(defaultInputs);

    expect(outputs.itPowerKw).toBe(1000);
    expect(outputs.coolingPowerKw).toBeCloseTo(188.18, 2);
    expect(outputs.totalFacilityPowerKw).toBeCloseTo(1368.93, 2);
    expect(outputs.pue).toBeCloseTo(1.3689, 4);
    expect(outputs.annualEnergyKwh).toBeCloseTo(11_991_803, 0);
  });

  it("applies cooling, climate, wet-bulb, and redundancy modifiers", () => {
    const outputs = calculateSimulation({
      ...defaultInputs,
      coolingType: "direct_to_chip_liquid_cooling",
      climatePreset: "hot_humid_peak_day",
      wetBulbTempC: 30,
      redundancyLevel: "2N",
      chillerCop: 6.8,
      fanPowerFactor: 0.04,
      pumpPowerFactor: 0.06,
    });

    expect(outputs.coolingPowerKw).toBeCloseTo(111.66, 2);
    expect(outputs.fanPowerKw).toBe(16);
    expect(outputs.pumpPowerKw).toBe(75);
    expect(outputs.pue).toBeCloseTo(1.273, 3);
  });

  it("calculates WUE from the selected heat rejection type", () => {
    const waterCooled = calculateSimulation(defaultInputs);
    const airCooled = calculateSimulation({
      ...defaultInputs,
      heatRejectionType: "air_cooled_chiller",
    });

    expect(waterCooled.wueLitresPerKwh).toBe(1.6);
    expect(airCooled.wueLitresPerKwh).toBe(0.1);
  });

  it("rejects invalid operating assumptions", () => {
    expect(() =>
      calculateSimulation({
        ...defaultInputs,
        chillerCop: 0,
      }),
    ).toThrow("Chiller COP must be a positive number.");
  });
});

describe("getRecommendations", () => {
  it("flags low chiller COP, high fan factor, and high-density air cooling", () => {
    const inputs = {
      ...defaultInputs,
      chillerCop: 4.5,
      fanPowerFactor: 0.12,
      rackDensityKw: 30,
      coolingType: "air_cooling" as const,
    };
    const outputs = calculateSimulation(inputs);
    const recommendations = getRecommendations(inputs, outputs);

    expect(recommendations.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        "Review chiller plant efficiency",
        "Improve airflow management",
        "Model high-density cooling alternatives",
      ]),
    );
  });
});
