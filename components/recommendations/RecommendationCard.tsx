import type { Recommendation } from "@/lib/types";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--ink)]">{recommendation.title}</h2>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded border border-[var(--line)] bg-[var(--panel-strong)] px-2 py-1">
            {recommendation.impact} impact
          </span>
          <span className="rounded border border-[var(--line)] bg-[var(--panel-strong)] px-2 py-1">
            {recommendation.difficulty} difficulty
          </span>
        </div>
      </div>
      <p className="mt-3 leading-7 text-[var(--muted)]">{recommendation.why}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {recommendation.metrics.map((metric) => (
          <span className="rounded bg-[#e8f7f5] px-2 py-1 text-xs font-semibold text-[var(--accent-strong)]" key={metric}>
            {metric}
          </span>
        ))}
      </div>
    </article>
  );
}
