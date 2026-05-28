const lessons = [
  {
    title: "What is a data centre?",
    body: "A data centre is a controlled facility that houses compute, storage, networking, power, and cooling systems.",
    takeaway: "IT power becomes heat, and the facility must remove it reliably.",
  },
  {
    title: "Why does cooling matter?",
    body: "Cooling is usually the largest non-IT load, so small efficiency changes can move annual energy and carbon meaningfully.",
    takeaway: "Airflow, chilled water, and heat rejection are central design levers.",
  },
  {
    title: "What is PUE?",
    body: "PUE compares total facility power against IT power. Lower values mean less overhead for the same compute load.",
    takeaway: "A PUE of 1.30 means 0.30 kW of overhead for every 1 kW of IT load.",
  },
  {
    title: "Why is Singapore challenging?",
    body: "High humidity and warm ambient conditions reduce free-cooling opportunities and put more pressure on chilled water systems.",
    takeaway: "Tropical performance depends on plant efficiency and operating discipline.",
  },
  {
    title: "Air cooling versus liquid cooling",
    body: "Liquid cooling can reduce fan energy and support higher rack density, but it usually increases pumping and operational complexity.",
    takeaway: "The better option depends on density, reliability, water, and maintainability goals.",
  },
  {
    title: "Why does water use matter?",
    body: "Water-cooled systems may save energy but consume more water, while air-cooled systems often do the opposite.",
    takeaway: "WUE belongs beside PUE in tropical sustainability planning.",
  },
];

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">Learning Mode</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">Data centre sustainability basics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson, index) => (
          <article className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm" key={lesson.title}>
            <div className="mb-4 h-20 rounded border border-[var(--line)] bg-[#10201d] p-3 text-white">
              <div className="grid h-full grid-cols-4 items-center gap-2 text-center text-xs font-semibold">
                {["IT", "Heat", "Cooling", "Grid"].map((item, itemIndex) => (
                  <div
                    className={`grid h-full place-items-center rounded ${itemIndex === index % 4 ? "bg-[var(--accent)]" : "bg-white/10"}`}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <h2 className="text-xl font-semibold text-[var(--ink)]">{lesson.title}</h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">{lesson.body}</p>
            <p className="mt-4 rounded border border-[var(--line)] bg-[var(--panel-strong)] p-3 text-sm font-medium text-[var(--foreground)]">
              {lesson.takeaway}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
