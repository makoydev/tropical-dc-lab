import type { SimulationOutputs } from "@/lib/types";
import { formatKwh, formatKw, formatLitres, formatNumber, formatTonnes } from "@/lib/format";

export function MetricCards({ outputs }: { outputs: SimulationOutputs }) {
  const metrics = [
    { label: "IT Load", value: formatKw(outputs.itPowerKw), tone: "neutral" },
    { label: "Cooling Energy", value: formatKw(outputs.coolingPowerKw), tone: "neutral" },
    { label: "Fan Energy", value: formatKw(outputs.fanPowerKw), tone: "neutral" },
    { label: "Pump Energy", value: formatKw(outputs.pumpPowerKw), tone: "neutral" },
    { label: "Other Facility", value: formatKw(outputs.otherFacilityPowerKw), tone: "neutral" },
    { label: "Total Facility", value: formatKw(outputs.totalFacilityPowerKw), tone: "strong" },
    { label: "PUE", value: formatNumber(outputs.pue, 2), tone: pueTone(outputs.pue) },
    { label: "Annual Energy", value: formatKwh(outputs.annualEnergyKwh), tone: "neutral" },
    { label: "Annual Carbon", value: formatTonnes(outputs.annualCarbonTonnesCo2e), tone: "neutral" },
    { label: "Annual Water", value: formatLitres(outputs.annualWaterLitres), tone: "neutral" },
    { label: "WUE", value: `${formatNumber(outputs.wueLitresPerKwh, 1)} L/kWh`, tone: "neutral" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div
          className={`rounded border p-4 ${metric.tone === "good" ? "border-emerald-200 bg-emerald-50" : ""} ${
            metric.tone === "warn" ? "border-amber-200 bg-amber-50" : ""
          } ${metric.tone === "bad" ? "border-red-200 bg-red-50" : ""} ${
            metric.tone === "strong" ? "border-[var(--accent)] bg-[#e8f7f5]" : ""
          } ${metric.tone === "neutral" ? "border-[var(--line)] bg-white" : ""}`}
          key={metric.label}
        >
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

function pueTone(pue: number) {
  if (pue <= 1.3) {
    return "good";
  }

  if (pue <= 1.5) {
    return "warn";
  }

  return "bad";
}
