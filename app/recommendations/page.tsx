import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { calculateSimulation } from "@/lib/calculations/simulation";
import { getRecommendations } from "@/lib/calculations/recommendations";
import { defaultInputs } from "@/lib/presets/defaults";

export default function RecommendationsPage() {
  const outputs = calculateSimulation(defaultInputs);
  const recommendations = getRecommendations(defaultInputs, outputs);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">Recommendations</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">Ranked improvement signals</h1>
      </div>
      <div className="grid gap-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.title} recommendation={recommendation} />
        ))}
      </div>
      <section className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Green DC readiness map</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Energy Performance & Carbon Efficiency", outputs.pue <= 1.3 ? "Strong signal" : outputs.pue <= 1.5 ? "Moderate signal" : "Needs improvement"],
            ["Sustainable Operations", "Scenario planning included"],
            ["Digital Innovation & Smart Systems", "Interactive estimator and monitoring assumptions"],
            ["Water Efficiency", "WUE tracked"],
            ["Maintainability", "Parameter assumptions exposed"],
            ["Resilience and Reliability", `${defaultInputs.redundancyLevel} topology modeled`],
          ].map(([category, status]) => (
            <div className="rounded border border-[var(--line)] bg-[var(--panel-strong)] p-4" key={category}>
              <p className="font-semibold text-[var(--ink)]">{category}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
