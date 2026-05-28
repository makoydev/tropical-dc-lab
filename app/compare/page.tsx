import { ScenarioComparisonChart } from "@/components/charts/ScenarioComparisonChart";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { formatKwh, formatKw, formatLitres, formatNumber, formatTonnes } from "@/lib/format";
import { scenarioPresets } from "@/lib/presets/scenarios";

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">Scenario Compare</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">Cooling strategy trade-offs</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {scenarioPresets.map((scenario) => {
          const outputs = calculateSimulation(scenario.inputs);
          return (
            <article className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm" key={scenario.name}>
              <h2 className="text-xl font-semibold text-[var(--ink)]">{scenario.name}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--muted)]">{scenario.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Metric label="PUE" value={formatNumber(outputs.pue, 2)} />
                <Metric label="Cooling" value={formatKw(outputs.coolingPowerKw)} />
                <Metric label="Annual Energy" value={formatKwh(outputs.annualEnergyKwh)} />
                <Metric label="Annual Carbon" value={formatTonnes(outputs.annualCarbonTonnesCo2e)} />
                <Metric label="Annual Water" value={formatLitres(outputs.annualWaterLitres)} />
                <Metric label="Fan / Pump" value={`${formatKw(outputs.fanPowerKw)} / ${formatKw(outputs.pumpPowerKw)}`} />
              </dl>
            </article>
          );
        })}
      </div>
      <div className="mt-6">
        <ScenarioComparisonChart scenarios={scenarioPresets} />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--line)] bg-[var(--panel-strong)] p-3">
      <dt className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--ink)]">{value}</dd>
    </div>
  );
}
