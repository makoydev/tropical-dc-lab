"use client";

import type { ClimatePreset, CoolingType, HeatRejectionType, RedundancyLevel, SimulationInputs } from "@/lib/types";
import {
  climatePresetLabels,
  coolingTypeLabels,
  heatRejectionLabels,
  rackDensityOptions,
  redundancyLabels,
} from "@/lib/presets/options";

interface ControlPanelProps {
  inputs: SimulationInputs;
  onChange: (inputs: SimulationInputs) => void;
}

export function ControlPanel({ inputs, onChange }: ControlPanelProps) {
  const update = <K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--ink)]">IT and Load</h2>
        <Slider label="IT Load" value={inputs.itLoadKw} min={100} max={5000} step={50} unit="kW" onChange={(value) => update("itLoadKw", value)} />
        <Slider label="IT Utilization" value={inputs.itUtilizationPercent} min={20} max={100} step={1} unit="%" onChange={(value) => update("itUtilizationPercent", value)} />
        <Select
          label="Rack Density"
          value={String(inputs.rackDensityKw)}
          options={rackDensityOptions.map((value) => ({ value: String(value), label: `${value} kW/rack` }))}
          onChange={(value) => update("rackDensityKw", Number(value))}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--ink)]">Cooling System</h2>
        <Select
          label="Cooling Type"
          value={inputs.coolingType}
          options={Object.entries(coolingTypeLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => update("coolingType", value as CoolingType)}
        />
        <Slider label="Chiller COP" value={inputs.chillerCop} min={3} max={8} step={0.1} unit="" onChange={(value) => update("chillerCop", value)} />
        <Slider label="Supply Air Temperature" value={inputs.supplyAirTempC} min={18} max={30} step={1} unit="C" onChange={(value) => update("supplyAirTempC", value)} />
        <Slider label="Return Air Temperature" value={inputs.returnAirTempC} min={25} max={45} step={1} unit="C" onChange={(value) => update("returnAirTempC", value)} />
        <Slider label="Fan Power Factor" value={inputs.fanPowerFactor} min={0.03} max={0.2} step={0.01} unit="" onChange={(value) => update("fanPowerFactor", value)} />
        <Slider label="Pump Power Factor" value={inputs.pumpPowerFactor} min={0.01} max={0.1} step={0.005} unit="" onChange={(value) => update("pumpPowerFactor", value)} />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--ink)]">Climate and Reliability</h2>
        <Select
          label="Climate Preset"
          value={inputs.climatePreset}
          options={Object.entries(climatePresetLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => update("climatePreset", value as ClimatePreset)}
        />
        <Slider label="Wet-Bulb Temperature" value={inputs.wetBulbTempC} min={23} max={30} step={1} unit="C" onChange={(value) => update("wetBulbTempC", value)} />
        <Select
          label="Heat Rejection"
          value={inputs.heatRejectionType}
          options={Object.entries(heatRejectionLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => update("heatRejectionType", value as HeatRejectionType)}
        />
        <Select
          label="Redundancy"
          value={inputs.redundancyLevel}
          options={Object.entries(redundancyLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => update("redundancyLevel", value as RedundancyLevel)}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--ink)]">Sustainability Assumptions</h2>
        <NumberInput
          label="Grid Emissions Factor"
          value={inputs.gridEmissionsFactorKgCo2ePerKwh}
          min={0}
          step={0.001}
          unit="kgCO2e/kWh"
          onChange={(value) => update("gridEmissionsFactorKgCo2ePerKwh", value)}
        />
        <NumberInput
          label="Operating Hours"
          value={inputs.operatingHoursPerYear}
          min={1}
          step={1}
          unit="hours/year"
          onChange={(value) => update("operatingHoursPerYear", value)}
        />
      </section>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="tabular-nums text-[var(--muted)]">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </span>
      <input
        className="w-full accent-[var(--accent)]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-[var(--foreground)]">{label}</span>
      <select
        className="w-full rounded border border-[var(--line)] bg-white px-3 py-2 text-[var(--foreground)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberInput({
  label,
  value,
  min,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-[var(--foreground)]">{label}</span>
      <div className="flex overflow-hidden rounded border border-[var(--line)] bg-white">
        <input
          className="min-w-0 flex-1 px-3 py-2 text-[var(--foreground)] outline-none"
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="number"
          value={value}
        />
        <span className="border-l border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2 text-[var(--muted)]">
          {unit}
        </span>
      </div>
    </label>
  );
}
