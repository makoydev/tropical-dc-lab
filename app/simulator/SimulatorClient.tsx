"use client";

import { useMemo, useState } from "react";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { defaultInputs } from "@/lib/presets/defaults";
import type { SimulationInputs } from "@/lib/types";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { DataCenter3DScene } from "@/components/simulator/DataCenter3DScene";
import { ComponentInfoPanel, type ComponentKey } from "@/components/simulator/DataCenterSchematic";
import { MetricCards } from "@/components/simulator/MetricCards";
import { EnergyBreakdownChart } from "@/components/charts/EnergyBreakdownChart";

export default function SimulatorClient() {
  const [inputs, setInputs] = useState<SimulationInputs>(defaultInputs);
  const [activeComponent, setActiveComponent] = useState<ComponentKey>("racks");
  const outputs = useMemo(() => calculateSimulation(inputs), [inputs]);
  const applyQuickScenario = (scenario: "peak" | "efficient" | "liquid" | "reset") => {
    if (scenario === "reset") {
      setInputs(defaultInputs);
      return;
    }

    if (scenario === "peak") {
      setInputs({
        ...inputs,
        itLoadKw: 4200,
        itUtilizationPercent: 92,
        rackDensityKw: 30,
        coolingType: "air_cooling",
        chillerCop: 4.2,
        fanPowerFactor: 0.15,
        pumpPowerFactor: 0.07,
        climatePreset: "hot_humid_peak_day",
        wetBulbTempC: 30,
        redundancyLevel: "2N",
      });
      return;
    }

    if (scenario === "efficient") {
      setInputs({
        ...inputs,
        coolingType: "optimized_air_cooling",
        chillerCop: 6.6,
        supplyAirTempC: 26,
        fanPowerFactor: 0.055,
        pumpPowerFactor: 0.03,
        climatePreset: "rainy_lower_ambient_day",
        wetBulbTempC: 24,
        heatRejectionType: "hybrid_cooling",
        redundancyLevel: "N+1",
      });
      return;
    }

    setInputs({
      ...inputs,
      rackDensityKw: 50,
      coolingType: "direct_to_chip_liquid_cooling",
      chillerCop: 6.9,
      supplyAirTempC: 28,
      fanPowerFactor: 0.035,
      pumpPowerFactor: 0.075,
      heatRejectionType: "hybrid_cooling",
    });
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">3D PUE Simulator</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">Walk through a tropical data centre</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Watch cold air, hot return air, chilled water, and grid power move through a simplified facility. Educational estimator only.
          </p>
        </div>
      </div>

      <DataCenter3DScene activeKey={activeComponent} inputs={inputs} onSelect={setActiveComponent} outputs={outputs} />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="space-y-5">
          <ComponentInfoPanel activeKey={activeComponent} />
          <EnergyBreakdownChart outputs={outputs} />
        </section>
        <aside className="space-y-5">
          <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[var(--ink)]">Quick stress tests</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <QuickButton label="Peak tropical day" onClick={() => applyQuickScenario("peak")} />
              <QuickButton label="Efficient tuning" onClick={() => applyQuickScenario("efficient")} />
              <QuickButton label="Liquid cooling shift" onClick={() => applyQuickScenario("liquid")} />
              <QuickButton label="Reset" onClick={() => applyQuickScenario("reset")} />
            </div>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
            <ControlPanel inputs={inputs} onChange={setInputs} />
          </div>
          <MetricCards outputs={outputs} />
        </aside>
      </div>
    </div>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[#e8f7f5]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
