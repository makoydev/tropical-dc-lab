"use client";

export type ComponentKey = "racks" | "coldAisle" | "hotAisle" | "crah" | "pump" | "chiller" | "tower" | "grid";

interface ComponentInfo {
  key: ComponentKey;
  label: string;
  x: number;
  y: number;
  description: string;
  parameters: string;
}

export const schematicComponents: ComponentInfo[] = [
  {
    key: "racks",
    label: "IT Racks",
    x: 68,
    y: 90,
    description: "Server racks convert IT power into heat that the cooling system must remove.",
    parameters: "IT load, utilization, rack density",
  },
  {
    key: "coldAisle",
    label: "Cold Aisle",
    x: 268,
    y: 52,
    description: "Supply air reaches server inlets through controlled cold aisles.",
    parameters: "Supply temperature, airflow management",
  },
  {
    key: "hotAisle",
    label: "Hot Aisle",
    x: 268,
    y: 132,
    description: "Hot return air is isolated so cooling units can remove heat efficiently.",
    parameters: "Return temperature, containment quality",
  },
  {
    key: "crah",
    label: "CRAH / CRAC",
    x: 468,
    y: 90,
    description: "Computer room cooling units move air and transfer rack heat to the chilled water loop.",
    parameters: "Fan factor, cooling type",
  },
  {
    key: "pump",
    label: "Pump",
    x: 662,
    y: 45,
    description: "Pumps move chilled water or cooling fluid through the plant.",
    parameters: "Pump factor, liquid cooling design",
  },
  {
    key: "chiller",
    label: "Chiller",
    x: 662,
    y: 140,
    description: "The chiller rejects heat from the data hall and is represented by COP.",
    parameters: "Chiller COP, wet-bulb temperature",
  },
  {
    key: "tower",
    label: "Heat Rejection",
    x: 842,
    y: 90,
    description: "Cooling towers, air-cooled chillers, or hybrid systems reject heat outdoors.",
    parameters: "Heat rejection type, water factor, climate",
  },
  {
    key: "grid",
    label: "Power Grid",
    x: 468,
    y: 218,
    description: "Grid electricity drives the IT load and all facility overhead.",
    parameters: "Grid emissions factor, operating hours",
  },
];

export function DataCenterSchematic({
  activeKey,
  onSelect,
}: {
  activeKey: ComponentKey;
  onSelect: (key: ComponentKey) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[#10201d] p-4 shadow-sm">
      <svg className="h-auto w-full" role="img" viewBox="0 0 980 310">
        <title>Tropical data centre cooling system schematic</title>
        <defs>
          <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0,0 L8,4 L0,8 Z" fill="#79d6c9" />
          </marker>
        </defs>
        <path d="M146 110 H252" markerEnd="url(#arrow)" stroke="#79d6c9" strokeWidth="4" />
        <path d="M348 70 H452" markerEnd="url(#arrow)" stroke="#79d6c9" strokeWidth="4" />
        <path d="M348 150 H452" markerEnd="url(#arrow)" stroke="#f6a94c" strokeWidth="4" />
        <path d="M550 95 H646" markerEnd="url(#arrow)" stroke="#79d6c9" strokeWidth="4" />
        <path d="M736 65 C785 65 785 110 826 110" markerEnd="url(#arrow)" stroke="#79d6c9" strokeWidth="4" />
        <path d="M826 128 C776 128 779 160 736 160" markerEnd="url(#arrow)" stroke="#f6a94c" strokeWidth="4" />
        <path d="M508 218 V156" markerEnd="url(#arrow)" stroke="#dbe7e2" strokeWidth="3" strokeDasharray="8 8" />
        {schematicComponents.map((component) => {
          const active = activeKey === component.key;
          return (
            <g
                aria-label={component.label}
                className="cursor-pointer"
                key={component.key}
                onClick={() => onSelect(component.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onSelect(component.key);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <rect
                  fill={active ? "#0f8b8d" : "#203631"}
                  height="54"
                  rx="8"
                  stroke={active ? "#ffffff" : "#4c6b63"}
                  strokeWidth={active ? "3" : "1.5"}
                  width="132"
                  x={component.x}
                  y={component.y}
                />
                <text
                  fill="#ffffff"
                  fontSize="17"
                  fontWeight="700"
                  textAnchor="middle"
                  x={component.x + 66}
                  y={component.y + 32}
                >
                  {component.label}
                </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ComponentInfoPanel({ activeKey }: { activeKey: ComponentKey }) {
  const component = schematicComponents.find((item) => item.key === activeKey) ?? schematicComponents[0];

  return (
    <aside className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase text-[var(--accent-strong)]">Component</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{component.label}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{component.description}</p>
      <p className="mt-4 rounded border border-[var(--line)] bg-[var(--panel-strong)] p-3 text-sm text-[var(--muted)]">
        Affected by: {component.parameters}
      </p>
    </aside>
  );
}
