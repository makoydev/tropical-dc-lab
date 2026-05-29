"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { formatKw, formatNumber } from "@/lib/format";
import { defaultInputs } from "@/lib/presets/defaults";
import type { SimulationOutputs } from "@/lib/types";

export function EnergyBreakdownChart({ outputs }: { outputs: SimulationOutputs }) {
  const baseline = calculateSimulation(defaultInputs);
  const currentOverhead = getOverhead(outputs);
  const baselineOverhead = getOverhead(baseline);
  const overheadDelta = currentOverhead - baselineOverhead;
  const overheadComponents = [
    { label: "Cooling", value: outputs.coolingPowerKw, baseline: baseline.coolingPowerKw, color: "#0f8b8d" },
    { label: "Fans", value: outputs.fanPowerKw, baseline: baseline.fanPowerKw, color: "#5aa469" },
    { label: "Pumps", value: outputs.pumpPowerKw, baseline: baseline.pumpPowerKw, color: "#c16a15" },
    { label: "Other", value: outputs.otherFacilityPowerKw, baseline: baseline.otherFacilityPowerKw, color: "#7b6f9b" },
  ];
  const maxOverheadComponent = Math.max(...overheadComponents.map((item) => item.value), 1);
  const itShare = (outputs.itPowerKw / outputs.totalFacilityPowerKw) * 100;
  const overheadShare = 100 - itShare;
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
    <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">Power Breakdown</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Facility total plus overhead-only view for visible parameter changes.</p>
        </div>
        <div className={`rounded px-3 py-2 text-right text-sm font-semibold ${overheadDelta <= 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          <p className="text-xs uppercase">Overhead delta</p>
          <p>{formatSignedKw(overheadDelta)}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer height="100%" width="100%">
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

      <div className="mt-5 rounded border border-[var(--line)] bg-[var(--panel-strong)] p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-[var(--ink)]">IT vs facility overhead</span>
          <span className="text-[var(--muted)]">{formatNumber(overheadShare, 1)}% overhead</span>
        </div>
        <div className="mt-3 flex h-5 overflow-hidden rounded bg-white">
          <div className="bg-[#10201d]" style={{ width: `${itShare}%` }} title={`IT ${formatNumber(itShare, 1)}%`} />
          <div className="bg-[var(--accent)]" style={{ width: `${overheadShare}%` }} title={`Overhead ${formatNumber(overheadShare, 1)}%`} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Overhead focus</h3>
        {overheadComponents.map((item) => {
          const width = Math.max((item.value / maxOverheadComponent) * 100, 3);
          const delta = item.value - item.baseline;
          return (
            <div className="grid gap-2 sm:grid-cols-[5rem_1fr_7rem]" key={item.label}>
              <div className="text-sm font-medium text-[var(--foreground)]">{item.label}</div>
              <div className="h-7 overflow-hidden rounded bg-[var(--panel-strong)]">
                <div
                  className="flex h-full items-center justify-end rounded px-2 text-xs font-semibold text-white transition-all duration-300"
                  style={{ backgroundColor: item.color, width: `${width}%` }}
                >
                  {formatKw(item.value)}
                </div>
              </div>
              <div className={`text-sm font-semibold tabular-nums ${delta <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {formatSignedKw(delta)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getOverhead(outputs: SimulationOutputs) {
  return outputs.totalFacilityPowerKw - outputs.itPowerKw;
}

function formatSignedKw(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatKw(value)}`;
}
