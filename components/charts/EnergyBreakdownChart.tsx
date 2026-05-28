"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SimulationOutputs } from "@/lib/types";

export function EnergyBreakdownChart({ outputs }: { outputs: SimulationOutputs }) {
  const data = [
    {
      name: "Facility Power",
      IT: outputs.itPowerKw,
      Cooling: outputs.coolingPowerKw,
      Fans: outputs.fanPowerKw,
      Pumps: outputs.pumpPowerKw,
      Other: outputs.otherFacilityPowerKw,
    },
  ];

  return (
    <div className="h-72 rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-[var(--ink)]">Power Breakdown</h2>
      <ResponsiveContainer height="85%" width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#d8e1dd" strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit=" kW" />
          <Tooltip />
          <Legend />
          <Bar dataKey="IT" fill="#10201d" stackId="a" />
          <Bar dataKey="Cooling" fill="#0f8b8d" stackId="a" />
          <Bar dataKey="Fans" fill="#5aa469" stackId="a" />
          <Bar dataKey="Pumps" fill="#c16a15" stackId="a" />
          <Bar dataKey="Other" fill="#7b6f9b" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
