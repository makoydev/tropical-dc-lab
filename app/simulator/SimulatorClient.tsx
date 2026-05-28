"use client";

import { useMemo, useState } from "react";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { defaultInputs } from "@/lib/presets/defaults";
import type { SimulationInputs } from "@/lib/types";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { ComponentInfoPanel, DataCenterSchematic, type ComponentKey } from "@/components/simulator/DataCenterSchematic";
import { MetricCards } from "@/components/simulator/MetricCards";
import { EnergyBreakdownChart } from "@/components/charts/EnergyBreakdownChart";

export default function SimulatorClient() {
  const [inputs, setInputs] = useState<SimulationInputs>(defaultInputs);
  const [activeComponent, setActiveComponent] = useState<ComponentKey>("racks");
  const outputs = useMemo(() => calculateSimulation(inputs), [inputs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">PUE Simulator</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">Tropical data centre model</h1>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Educational estimator only. Not certified Green Mark scoring, audit output, or engineering design advice.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <DataCenterSchematic activeKey={activeComponent} onSelect={setActiveComponent} />
          <ComponentInfoPanel activeKey={activeComponent} />
          <EnergyBreakdownChart outputs={outputs} />
        </section>
        <aside className="space-y-5">
          <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
            <ControlPanel inputs={inputs} onChange={setInputs} />
          </div>
          <MetricCards outputs={outputs} />
        </aside>
      </div>
    </div>
  );
}
