"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScenarioPreset } from "@/lib/types";
import { calculateSimulation } from "@/lib/calculations/simulation";

export function ScenarioComparisonChart({ scenarios }: { scenarios: ScenarioPreset[] }) {
  const data = scenarios.map((scenario) => {
    const outputs = calculateSimulation(scenario.inputs);
    return {
      name: scenario.name.replace(" Cooling", ""),
      PUE: Number(outputs.pue.toFixed(2)),
      Carbon: Number(outputs.annualCarbonTonnesCo2e.toFixed(0)),
      Water: Number((outputs.annualWaterLitres / 1_000_000).toFixed(1)),
    };
  });

  return (
    <div className="h-80 rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-[var(--ink)]">Scenario Metrics</h2>
      <ResponsiveContainer height="85%" width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#d8e1dd" strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="PUE" fill="#0f8b8d" />
          <Bar dataKey="Carbon" fill="#c16a15" />
          <Bar dataKey="Water" fill="#5aa469" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
