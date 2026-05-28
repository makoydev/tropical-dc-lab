import Link from "next/link";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { defaultInputs } from "@/lib/presets/defaults";
import { formatKw, formatNumber, formatTonnes } from "@/lib/format";

export default function Home() {
  const outputs = calculateSimulation(defaultInputs);

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">
              Singapore tropical data centre simulator
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[var(--ink)] sm:text-6xl">
              TropicalDC Lab
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Explore how IT load, cooling design, chiller efficiency, airflow, heat rejection, and redundancy affect PUE, WUE, and estimated carbon impact.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              href="/simulator"
            >
              Start Simulation
            </Link>
            <Link
              className="rounded border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-strong)]"
              href="/learn"
            >
              Learn Data Centres
            </Link>
          </div>
          <p className="max-w-2xl rounded border border-[var(--line)] bg-white/80 p-4 text-sm leading-6 text-[var(--muted)]">
            TropicalDC Lab is an educational simulator. Calculations are simplified and should not be used as a substitute for professional engineering analysis, certified Green Mark assessment, or official data-centre design work.
          </p>
        </div>
        <div className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm sm:grid-cols-2">
          {[
            ["PUE", formatNumber(outputs.pue, 2)],
            ["Total Facility Power", formatKw(outputs.totalFacilityPowerKw)],
            ["Annual Carbon", formatTonnes(outputs.annualCarbonTonnesCo2e)],
            ["WUE", `${formatNumber(outputs.wueLitresPerKwh, 1)} L/kWh`],
          ].map(([label, value]) => (
            <div className="rounded border border-[var(--line)] bg-[var(--panel-strong)] p-5" key={label}>
              <p className="text-sm text-[var(--muted)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">{value}</p>
            </div>
          ))}
          <div className="col-span-full overflow-hidden rounded border border-[var(--line)] bg-[#10201d] p-5 text-white">
            <div className="grid grid-cols-5 items-center gap-3 text-center text-xs">
              {["IT Racks", "Aisle", "CRAH", "Chiller", "Tower"].map((item, index) => (
                <div className="relative rounded bg-white/10 p-3" key={item}>
                  {item}
                  {index < 4 ? (
                    <span className="absolute right-[-1rem] top-1/2 h-px w-4 bg-[#79d6c9]" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
