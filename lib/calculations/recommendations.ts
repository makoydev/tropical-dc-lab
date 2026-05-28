import type { Recommendation, SimulationInputs, SimulationOutputs } from "@/lib/types";

export function getRecommendations(
  inputs: SimulationInputs,
  outputs: SimulationOutputs,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (outputs.pue > 1.5) {
    recommendations.push({
      title: "Reduce facility overhead",
      why: "PUE above 1.50 suggests cooling, fan, pump, or miscellaneous facility loads are dominating the facility energy profile.",
      impact: "High",
      difficulty: "Medium",
      metrics: ["PUE", "Carbon", "Energy"],
    });
  }

  if (inputs.chillerCop < 5.5) {
    recommendations.push({
      title: "Review chiller plant efficiency",
      why: "A lower COP raises cooling power for the same IT heat load, especially in tropical operating conditions.",
      impact: "High",
      difficulty: "High",
      metrics: ["PUE", "Carbon", "Cooling"],
    });
  }

  if (inputs.fanPowerFactor > 0.1) {
    recommendations.push({
      title: "Improve airflow management",
      why: "High fan energy often points to bypass airflow, containment gaps, or static pressure settings that can be tuned.",
      impact: "Medium",
      difficulty: "Medium",
      metrics: ["PUE", "Fan Energy"],
    });
  }

  if (inputs.rackDensityKw >= 30 && inputs.coolingType === "air_cooling") {
    recommendations.push({
      title: "Model high-density cooling alternatives",
      why: "Dense racks are harder to cool with conventional air systems and may benefit from rear-door or direct liquid cooling.",
      impact: "High",
      difficulty: "High",
      metrics: ["PUE", "Reliability", "Thermal Risk"],
    });
  }

  if (inputs.heatRejectionType === "water_cooled_cooling_tower" && outputs.annualWaterLitres > 10_000_000) {
    recommendations.push({
      title: "Compare water-efficient heat rejection",
      why: "Cooling towers can reduce energy but increase water demand, so hybrid or air-cooled alternatives should be compared.",
      impact: "Medium",
      difficulty: "Medium",
      metrics: ["Water", "WUE", "Energy"],
    });
  }

  if (inputs.redundancyLevel === "2N") {
    recommendations.push({
      title: "Review reliability versus efficiency",
      why: "2N architecture improves resilience but adds standby and auxiliary overhead that should be justified by criticality.",
      impact: "Medium",
      difficulty: "High",
      metrics: ["Reliability", "PUE", "Cost"],
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain performance discipline",
      why: "The current configuration is within the simplified target range. Keep monitoring energy, water, and thermal margins as load changes.",
      impact: "Medium",
      difficulty: "Low",
      metrics: ["PUE", "WUE", "Operations"],
    });
  }

  return recommendations;
}
