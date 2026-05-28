"use client";

import { calculateSimulation } from "@/lib/calculations/simulation";
import { getRecommendations } from "@/lib/calculations/recommendations";
import { formatKwh, formatKw, formatLitres, formatNumber, formatTonnes } from "@/lib/format";
import { defaultInputs } from "@/lib/presets/defaults";
import { climatePresetLabels, coolingTypeLabels, heatRejectionLabels } from "@/lib/presets/options";

export default function ReportPage() {
  const outputs = calculateSimulation(defaultInputs);
  const recommendations = getRecommendations(defaultInputs, outputs);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">Export Report</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">TropicalDC Lab scenario report</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Generated on {new Date().toLocaleDateString("en-SG")}</p>
        </div>
        <button className="no-print rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" onClick={() => window.print()} type="button">
          Print Report
        </button>
      </div>
      <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Key Metrics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ReportMetric label="PUE" value={formatNumber(outputs.pue, 2)} />
          <ReportMetric label="Total Facility Power" value={formatKw(outputs.totalFacilityPowerKw)} />
          <ReportMetric label="Annual Energy" value={formatKwh(outputs.annualEnergyKwh)} />
          <ReportMetric label="Annual Carbon" value={formatTonnes(outputs.annualCarbonTonnesCo2e)} />
          <ReportMetric label="Annual Water" value={formatLitres(outputs.annualWaterLitres)} />
          <ReportMetric label="WUE" value={`${formatNumber(outputs.wueLitresPerKwh, 1)} L/kWh`} />
        </div>
      </section>
      <section className="mt-5 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Input Assumptions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ReportMetric label="Cooling Type" value={coolingTypeLabels[defaultInputs.coolingType]} />
          <ReportMetric label="Climate" value={climatePresetLabels[defaultInputs.climatePreset]} />
          <ReportMetric label="Heat Rejection" value={heatRejectionLabels[defaultInputs.heatRejectionType]} />
          <ReportMetric label="Redundancy" value={defaultInputs.redundancyLevel} />
          <ReportMetric label="Chiller COP" value={String(defaultInputs.chillerCop)} />
          <ReportMetric label="Grid Factor" value={`${defaultInputs.gridEmissionsFactorKgCo2ePerKwh} kgCO2e/kWh`} />
        </div>
      </section>
      <section className="mt-5 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Recommendations</h2>
        <ul className="mt-4 space-y-3">
          {recommendations.map((item) => (
            <li className="rounded border border-[var(--line)] bg-[var(--panel-strong)] p-3" key={item.title}>
              <strong>{item.title}</strong>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.why}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-5 rounded border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
        TropicalDC Lab is an educational simulator. Calculations are simplified and should not be used as a substitute for professional engineering analysis, certified Green Mark assessment, or official data-centre design work.
      </p>
    </main>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--line)] bg-[var(--panel-strong)] p-3">
      <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}
