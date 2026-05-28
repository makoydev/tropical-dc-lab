# TropicalDC Lab — Build Specification

## 1. Project Summary

**TropicalDC Lab** is an interactive web app for exploring sustainability trade-offs in Singapore-based tropical data centres. It lets users configure a simplified virtual data centre, adjust cooling and IT load parameters, and see how those choices affect Power Usage Effectiveness (PUE), Water Usage Effectiveness (WUE), estimated carbon impact, cooling energy, and Green Data Centre readiness.

The app is intended as a portfolio-grade, educational, and semi-technical simulator. It should demonstrate the creator's combined background in mechanical engineering, facilities engineering, software engineering, UI/UX, and project management.

### One-line positioning

> Interactive sustainability simulator for tropical data centres.

### Important disclaimer

The app must clearly state that it is an **educational estimator**, not a certified engineering design, audit, Green Mark scoring, or compliance tool.

Suggested disclaimer text:

> TropicalDC Lab is an educational simulator. Calculations are simplified and should not be used as a substitute for professional engineering analysis, certified Green Mark assessment, or official data-centre design work.

---

## 2. Strategic Purpose

This project should position the creator as someone who can build software for physical infrastructure, especially in Singapore's green data centre and smart facilities ecosystem.

### Career narrative supported by the project

> I build digital tools that help physical infrastructure become more energy-efficient, especially tropical data centres.

### Target career alignment

This app should support applications for roles such as:

- Data Centre Facilities Engineer
- Sustainability Engineer
- Energy Analytics Engineer
- Smart FM Engineer
- DCIM Software Engineer
- Technical Product Manager for infrastructure
- Technical Project Manager for data centres
- Solutions Engineer for smart building or energy systems
- Infrastructure Software Engineer

### Why this is a strong portfolio project

Most software engineers cannot credibly model cooling systems, PUE, chiller efficiency, and facility energy. Most mechanical or facilities engineers cannot build a polished interactive web app. This project should demonstrate both.

---

## 3. Target Users

### Primary users

1. **Junior engineers and students** learning how data centre sustainability works.
2. **Career switchers** trying to understand data centre operations and green infrastructure.
3. **Hiring managers** evaluating the creator's ability to combine engineering, software, and product thinking.
4. **Facility and sustainability professionals** who want a quick educational what-if simulator.

### Secondary users

1. Sustainability consultants.
2. Data centre operations teams.
3. Smart FM professionals.
4. Technical recruiters in infrastructure, data centre, and green tech sectors.

---

## 4. Product Goals

### Main goals

- Make data centre sustainability understandable through interaction.
- Let users visually explore how cooling choices affect PUE, WUE, carbon, and energy use.
- Demonstrate engineering reasoning using simplified but transparent calculations.
- Provide a strong public portfolio project with a clear Singapore sustainability angle.

### Non-goals for MVP

- Do not attempt official Green Mark certification scoring.
- Do not claim engineering-grade accuracy.
- Do not require real IoT integration.
- Do not overbuild user accounts or enterprise features at the start.
- Do not build a generic sustainability tracker.

---

## 5. Core Concept

The app presents a simplified virtual data centre with the following system flow:

```text
IT Racks → Hot Aisle / Cold Aisle → CRAH / CRAC Units → Chilled Water Loop → Chiller Plant → Cooling Tower / Heat Rejection → Grid Power
```

Users can interact with the system using sliders, dropdowns, scenario presets, and clickable components. As users modify assumptions, the app recalculates and visualizes key performance metrics in real time.

---

## 6. MVP Scope

The MVP should be called:

# TropicalDC Lab: PUE Simulator

### MVP pages

1. Landing Page
2. Simulator Page
3. Scenario Compare Page
4. Recommendations Page
5. Learning Mode Page
6. Export Report Page or Export Button

---

## 7. Page-by-Page Requirements

## 7.1 Landing Page

### Purpose

Explain the problem, the app, and why tropical data centre efficiency matters.

### Required sections

- Hero section
- Brief explanation of PUE
- Brief explanation of tropical cooling challenge
- Call-to-action button: `Start Simulation`
- Secondary button: `Learn How Data Centres Work`
- Disclaimer banner or footer note

### Suggested hero copy

**TropicalDC Lab**  
Interactive sustainability simulator for tropical data centres.

Explore how IT load, cooling design, chiller efficiency, airflow, and water use affect data centre PUE, WUE, and carbon impact in Singapore-like tropical conditions.

---

## 7.2 Simulator Page

### Purpose

This is the main interactive experience.

### Layout

Use a split-screen layout:

- Left side: interactive data centre schematic.
- Right side: controls and live metrics.

### Interactive schematic components

The visual diagram should include:

- IT racks
- Cold aisle
- Hot aisle
- CRAH/CRAC unit
- Chilled water pump
- Chiller
- Cooling tower or dry cooler
- Power grid

Each component should be clickable. Clicking a component opens a side panel or tooltip explaining:

- What it does
- Why it matters for energy use
- Which parameters affect it

### User-adjustable controls

#### IT and load

- IT Load in kW
  - Default: `1000 kW`
  - Range: `100 kW` to `5000 kW`
- IT Utilization
  - Default: `65%`
  - Range: `20%` to `100%`
- Rack Density
  - Default: `8 kW/rack`
  - Options: `4`, `8`, `15`, `30`, `50 kW/rack`

#### Cooling system

- Cooling Type
  - `Air Cooling`
  - `Optimized Air Cooling`
  - `Rear-Door Heat Exchanger`
  - `Direct-to-Chip Liquid Cooling`
- Chiller COP
  - Default: `5.5`
  - Range: `3.0` to `8.0`
- Supply Air Temperature
  - Default: `24°C`
  - Range: `18°C` to `30°C`
- Return Air Temperature
  - Default: `35°C`
  - Range: `25°C` to `45°C`
- Fan Power Factor
  - Default: `0.08`
  - Range: `0.03` to `0.20`
  - Meaning: fan energy as fraction of IT load
- Pump Power Factor
  - Default: `0.04`
  - Range: `0.01` to `0.10`
  - Meaning: pump energy as fraction of IT load

#### Climate and heat rejection

- Climate Preset
  - `Singapore Typical Tropical Day`
  - `Hot/Humid Peak Day`
  - `Rainy Lower Ambient Day`
- Wet-Bulb Temperature
  - Default: `27°C`
  - Range: `23°C` to `30°C`
- Heat Rejection Type
  - `Water-Cooled Cooling Tower`
  - `Air-Cooled Chiller`
  - `Hybrid Cooling`

#### Reliability

- Redundancy Level
  - `N`
  - `N+1`
  - `2N`
- Redundancy penalty factor
  - Apply internally based on selected level:
    - `N`: `1.00`
    - `N+1`: `1.03`
    - `2N`: `1.08`

#### Sustainability assumptions

- Grid Emissions Factor
  - Default: `0.416 kgCO2e/kWh`
  - Make editable
- Operating Hours
  - Default: `8760 hours/year`
- Water Use Factor
  - Default: based on cooling type

### Live output metrics

Show these in metric cards:

- IT Load
- Cooling Energy
- Fan Energy
- Pump Energy
- Other Facility Energy
- Total Facility Energy
- PUE
- Estimated Annual Energy Use
- Estimated Annual Carbon Emissions
- Estimated Annual Water Use
- WUE

---

## 8. Calculation Model

Keep the model simple, transparent, and easy to explain.

## 8.1 Key formula: PUE

```text
PUE = Total Facility Power / IT Equipment Power
```

Where:

```text
Total Facility Power = IT Power + Cooling Power + Fan Power + Pump Power + Other Facility Power
```

## 8.2 IT power

```text
IT Power = selected IT Load in kW
```

For MVP, utilization can be used as an educational modifier rather than a complex server-efficiency model.

Optional simplified utilization penalty:

```text
Effective IT Efficiency Penalty = 1 + ((100 - IT Utilization) / 100) * 0.10
```

This can be used to indicate that low utilization wastes capacity, but do not overcomplicate it.

## 8.3 Cooling power

Basic formula:

```text
Cooling Power = IT Load / Chiller COP
```

Apply cooling type modifier:

```text
Adjusted Cooling Power = Cooling Power × Cooling Type Factor × Climate Factor
```

Suggested cooling type factors:

| Cooling Type | Factor |
|---|---:|
| Air Cooling | 1.00 |
| Optimized Air Cooling | 0.85 |
| Rear-Door Heat Exchanger | 0.75 |
| Direct-to-Chip Liquid Cooling | 0.65 |

Suggested climate factors:

| Climate Preset | Factor |
|---|---:|
| Rainy Lower Ambient Day | 0.95 |
| Singapore Typical Tropical Day | 1.00 |
| Hot/Humid Peak Day | 1.08 |

Optional wet-bulb modifier:

```text
Wet Bulb Modifier = 1 + max(0, WetBulbTemp - 27) × 0.015
```

## 8.4 Fan power

```text
Fan Power = IT Load × Fan Power Factor × Cooling Type Fan Modifier
```

Suggested fan modifiers:

| Cooling Type | Fan Modifier |
|---|---:|
| Air Cooling | 1.00 |
| Optimized Air Cooling | 0.80 |
| Rear-Door Heat Exchanger | 0.65 |
| Direct-to-Chip Liquid Cooling | 0.40 |

## 8.5 Pump power

```text
Pump Power = IT Load × Pump Power Factor × Cooling Type Pump Modifier
```

Suggested pump modifiers:

| Cooling Type | Pump Modifier |
|---|---:|
| Air Cooling | 1.00 |
| Optimized Air Cooling | 1.00 |
| Rear-Door Heat Exchanger | 1.10 |
| Direct-to-Chip Liquid Cooling | 1.25 |

Liquid cooling may reduce fan power but increase pumping power. The app should show this trade-off.

## 8.6 Other facility power

```text
Other Facility Power = IT Load × Other Facility Factor
```

Default:

```text
Other Facility Factor = 0.05
```

This represents lighting, UPS losses, switchgear losses, monitoring systems, and miscellaneous facility loads.

## 8.7 Redundancy penalty

Apply to non-IT facility power:

```text
Facility Overhead = Cooling Power + Fan Power + Pump Power + Other Facility Power
Adjusted Facility Overhead = Facility Overhead × Redundancy Penalty Factor
Total Facility Power = IT Load + Adjusted Facility Overhead
```

## 8.8 Annual energy

```text
Annual Energy Use = Total Facility Power × Operating Hours
```

Unit: kWh/year

## 8.9 Annual carbon emissions

```text
Annual Carbon Emissions = Annual Energy Use × Grid Emissions Factor
```

Unit: kgCO2e/year

Show also in tonnes:

```text
Tonnes CO2e = kgCO2e / 1000
```

## 8.10 Water use and WUE

Use simplified water use factors by heat rejection type.

Suggested water use factors:

| Heat Rejection Type | Water Factor |
|---|---:|
| Water-Cooled Cooling Tower | 1.6 L/kWh IT |
| Hybrid Cooling | 0.8 L/kWh IT |
| Air-Cooled Chiller | 0.1 L/kWh IT |

```text
Annual Water Use = IT Load × Operating Hours × Water Factor
```

```text
WUE = Annual Water Use / Annual IT Energy
```

Unit: L/kWh

---

## 9. Scenario Compare Page

### Purpose

Allow users to compare different design or operational strategies.

### Required scenarios

Include at least three presets:

1. **Baseline Air Cooling**
   - Air cooling
   - Chiller COP: 4.8
   - Supply air temp: 22°C
   - Fan factor: 0.10
   - Pump factor: 0.04

2. **Optimized Tropical Air Cooling**
   - Optimized air cooling
   - Chiller COP: 6.2
   - Supply air temp: 26°C
   - Fan factor: 0.07
   - Pump factor: 0.035

3. **Liquid Cooling Assisted**
   - Direct-to-chip liquid cooling
   - Chiller COP: 6.8
   - Supply air temp: 28°C
   - Fan factor: 0.04
   - Pump factor: 0.06

### Comparison metrics

Show side-by-side cards and charts for:

- PUE
- Annual energy use
- Annual carbon emissions
- Annual water use
- Cooling power
- Fan power
- Pump power

### Visualization ideas

- Bar chart: PUE by scenario
- Bar chart: annual carbon by scenario
- Stacked bar: IT power vs cooling/fans/pumps/other
- Radar chart: energy, water, complexity, reliability, readiness

---

## 10. Recommendations Page

### Purpose

Give ranked improvement suggestions based on the current simulation.

### Recommendation logic

The app should inspect current parameter values and generate recommendations.

Example rules:

### Rule 1: High PUE

If:

```text
PUE > 1.5
```

Recommend:

- Improve chiller COP
- Optimize airflow management
- Raise supply air temperature where operationally acceptable
- Reduce fan energy
- Consider higher-efficiency cooling design

### Rule 2: Chiller COP low

If:

```text
Chiller COP < 5.5
```

Recommend:

- Evaluate high-efficiency chillers
- Improve condenser water temperature control
- Review chiller sequencing

### Rule 3: Fan factor high

If:

```text
Fan Power Factor > 0.10
```

Recommend:

- Improve hot aisle/cold aisle containment
- Reduce bypass airflow
- Use variable-speed fans
- Review static pressure settings

### Rule 4: High rack density with air cooling

If:

```text
Rack Density >= 30 kW/rack AND Cooling Type == Air Cooling
```

Recommend:

- Evaluate rear-door heat exchangers or direct-to-chip liquid cooling
- Separate high-density zones
- Model liquid cooling trade-offs

### Rule 5: Water usage high

If:

```text
Heat Rejection Type == Water-Cooled Cooling Tower AND Annual Water Use is high
```

Recommend:

- Compare hybrid cooling
- Review cycles of concentration
- Consider water efficiency strategy

### Rule 6: Redundancy penalty

If:

```text
Redundancy Level == 2N
```

Recommend:

- Explain reliability vs efficiency trade-off
- Review whether all systems require 2N
- Consider modular design and right-sizing

### Output format

Each recommendation card should include:

- Title
- Why it matters
- Expected impact: Low / Medium / High
- Affected metrics: PUE, carbon, water, reliability, cost
- Difficulty: Low / Medium / High

---

## 11. Green Mark / Green Data Centre Readiness Layer

### Purpose

Provide educational mapping to public sustainability themes without claiming official certification scoring.

### Suggested page or section title

**Green DC Readiness Map**

### Important wording

Use:

> Readiness map

Avoid:

> Official Green Mark score

### Suggested categories

1. Energy Performance & Carbon Efficiency
2. Sustainable Operations
3. Digital Innovation & Smart Systems
4. Water Efficiency
5. Maintainability
6. Resilience and Reliability

### Example readiness logic

| Metric / Input | Readiness Signal |
|---|---|
| PUE <= 1.3 | Strong energy performance signal |
| PUE 1.31–1.5 | Moderate energy performance signal |
| PUE > 1.5 | Needs improvement |
| Has scenario comparison | Good planning practice |
| Uses optimized cooling or liquid cooling | Innovation signal |
| Tracks WUE | Water awareness signal |
| Has monitoring assumptions | Smart systems signal |

### Visual

Use a radar chart or scorecard. Again, label it as educational/readiness only.

---

## 12. Learning Mode

### Purpose

Make the app accessible and shareable.

### Required lessons

1. What is a data centre?
2. Why does cooling matter?
3. What is PUE?
4. Why is Singapore's tropical climate challenging?
5. What is the difference between air cooling and liquid cooling?
6. Why does water use matter?
7. What trade-offs exist between efficiency, reliability, water, and cost?
8. How do smart systems help facility teams?

### Interaction style

Each lesson should include:

- Simple explanation
- Small diagram or animation
- One interactive control
- One takeaway

Example:

Lesson: What is PUE?

User drags a slider for cooling power. The app shows PUE rising or falling.

---

## 13. Report Export

### Purpose

Let users export their scenario as a portfolio-friendly artifact.

### Export contents

The report should include:

- Project/scenario name
- Date generated
- Input assumptions
- System configuration
- Key metrics
- Scenario comparison if available
- Recommendations
- Disclaimer

### Formats

MVP:

- Print-friendly HTML page
- Browser print to PDF

Future:

- Real PDF generation

---

## 14. Suggested Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- React Flow or SVG for interactive schematic
- Recharts for charts

### Backend

MVP can be frontend-only.

Optional backend:

- Next.js API routes
- Node.js
- FastAPI if Python-based modeling is preferred

### Database

Optional for MVP.

If saving scenarios:

- Supabase Postgres

### Deployment

- Vercel for web app
- GitHub for source code

### Testing

- Vitest for formula tests
- Playwright for basic UI flows

---

## 15. Suggested Folder Structure

```text
tropicaldc-lab/
  app/
    page.tsx
    simulator/
      page.tsx
    compare/
      page.tsx
    recommendations/
      page.tsx
    learn/
      page.tsx
    report/
      page.tsx
  components/
    layout/
    simulator/
      DataCenterSchematic.tsx
      ControlPanel.tsx
      MetricCards.tsx
      ComponentInfoPanel.tsx
    charts/
      PueChart.tsx
      EnergyBreakdownChart.tsx
      ScenarioComparisonChart.tsx
    recommendations/
      RecommendationCard.tsx
    learning/
      LessonCard.tsx
  lib/
    calculations/
      pue.ts
      energy.ts
      water.ts
      carbon.ts
      recommendations.ts
    presets/
      scenarios.ts
      climate.ts
      coolingTypes.ts
    types.ts
  tests/
    calculations.test.ts
  public/
  README.md
```

---

## 16. Core TypeScript Types

```ts
export type CoolingType =
  | 'air_cooling'
  | 'optimized_air_cooling'
  | 'rear_door_heat_exchanger'
  | 'direct_to_chip_liquid_cooling';

export type ClimatePreset =
  | 'rainy_lower_ambient_day'
  | 'singapore_typical_tropical_day'
  | 'hot_humid_peak_day';

export type HeatRejectionType =
  | 'water_cooled_cooling_tower'
  | 'air_cooled_chiller'
  | 'hybrid_cooling';

export type RedundancyLevel = 'N' | 'N+1' | '2N';

export interface SimulationInputs {
  itLoadKw: number;
  itUtilizationPercent: number;
  rackDensityKw: number;
  coolingType: CoolingType;
  chillerCop: number;
  supplyAirTempC: number;
  returnAirTempC: number;
  fanPowerFactor: number;
  pumpPowerFactor: number;
  climatePreset: ClimatePreset;
  wetBulbTempC: number;
  heatRejectionType: HeatRejectionType;
  redundancyLevel: RedundancyLevel;
  gridEmissionsFactorKgCo2ePerKwh: number;
  operatingHoursPerYear: number;
}

export interface SimulationOutputs {
  itPowerKw: number;
  coolingPowerKw: number;
  fanPowerKw: number;
  pumpPowerKw: number;
  otherFacilityPowerKw: number;
  totalFacilityPowerKw: number;
  pue: number;
  annualEnergyKwh: number;
  annualCarbonKgCo2e: number;
  annualCarbonTonnesCo2e: number;
  annualWaterLitres: number;
  wueLitresPerKwh: number;
}
```

---

## 17. Core Calculation Function Pseudocode

```ts
export function calculateSimulation(inputs: SimulationInputs): SimulationOutputs {
  const itPowerKw = inputs.itLoadKw;

  const coolingTypeFactor = getCoolingTypeFactor(inputs.coolingType);
  const climateFactor = getClimateFactor(inputs.climatePreset);
  const wetBulbModifier = 1 + Math.max(0, inputs.wetBulbTempC - 27) * 0.015;

  const baseCoolingPowerKw = itPowerKw / inputs.chillerCop;
  const coolingPowerKw = baseCoolingPowerKw * coolingTypeFactor * climateFactor * wetBulbModifier;

  const fanPowerKw =
    itPowerKw * inputs.fanPowerFactor * getFanModifier(inputs.coolingType);

  const pumpPowerKw =
    itPowerKw * inputs.pumpPowerFactor * getPumpModifier(inputs.coolingType);

  const otherFacilityPowerKw = itPowerKw * 0.05;

  const facilityOverheadKw =
    coolingPowerKw + fanPowerKw + pumpPowerKw + otherFacilityPowerKw;

  const adjustedFacilityOverheadKw =
    facilityOverheadKw * getRedundancyPenalty(inputs.redundancyLevel);

  const totalFacilityPowerKw = itPowerKw + adjustedFacilityOverheadKw;

  const pue = totalFacilityPowerKw / itPowerKw;

  const annualEnergyKwh = totalFacilityPowerKw * inputs.operatingHoursPerYear;

  const annualCarbonKgCo2e =
    annualEnergyKwh * inputs.gridEmissionsFactorKgCo2ePerKwh;

  const annualCarbonTonnesCo2e = annualCarbonKgCo2e / 1000;

  const annualItEnergyKwh = itPowerKw * inputs.operatingHoursPerYear;
  const waterFactor = getWaterFactor(inputs.heatRejectionType);
  const annualWaterLitres = annualItEnergyKwh * waterFactor;
  const wueLitresPerKwh = annualWaterLitres / annualItEnergyKwh;

  return {
    itPowerKw,
    coolingPowerKw,
    fanPowerKw,
    pumpPowerKw,
    otherFacilityPowerKw,
    totalFacilityPowerKw,
    pue,
    annualEnergyKwh,
    annualCarbonKgCo2e,
    annualCarbonTonnesCo2e,
    annualWaterLitres,
    wueLitresPerKwh,
  };
}
```

---

## 18. UI/UX Direction

### Visual style

- Clean, modern, technical but approachable
- Dark mode optional, but a dark infrastructure-control-room aesthetic would fit well
- Use cards, gauges, sliders, tooltips, and animated diagrams
- Avoid looking like a boring spreadsheet

### UI inspiration

- Digital twin dashboard
- Industrial monitoring interface
- Energy analytics dashboard
- Interactive learning simulator

### Key UI principles

- User should immediately see metrics change when adjusting controls.
- Every technical term should have a tooltip.
- Charts should be simple and readable.
- Avoid overwhelming users with too many controls at once.
- Use progressive disclosure: basic controls first, advanced controls hidden under an accordion.

---

## 19. MVP Build Tasks

### Phase 1: Foundation

- Set up Next.js + TypeScript + Tailwind.
- Create layout and navigation.
- Create static landing page.
- Create simulator route.
- Create calculation library.
- Add unit tests for PUE and energy calculations.

### Phase 2: Simulator

- Build control panel with sliders and dropdowns.
- Build live metric cards.
- Build simple data centre schematic using SVG or React Flow.
- Make schematic components clickable.
- Add component info panel.

### Phase 3: Scenario Comparison

- Add three scenario presets.
- Add scenario comparison cards.
- Add bar charts and stacked energy chart.

### Phase 4: Recommendations

- Implement rule-based recommendation engine.
- Create recommendation cards.
- Add impact and difficulty labels.

### Phase 5: Learning Mode

- Add lessons.
- Add small interactive examples.
- Add glossary/tooltips.

### Phase 6: Export and Polish

- Add print-friendly report page.
- Add export/print button.
- Add disclaimers.
- Improve responsiveness.
- Add README.
- Deploy to Vercel.

---

## 20. README Requirements

The GitHub README should include:

- Project name and screenshot
- What the app does
- Why it matters for Singapore and tropical data centres
- Feature list
- Tech stack
- Calculation methodology
- Assumptions and limitations
- How to run locally
- Future roadmap
- Disclaimer

### Suggested README intro

```md
# TropicalDC Lab

TropicalDC Lab is an interactive web simulator for exploring energy, water, and carbon trade-offs in tropical data centres. It allows users to adjust IT load, cooling strategy, chiller efficiency, airflow assumptions, heat rejection type, and redundancy level to see how these decisions affect PUE, WUE, and estimated annual emissions.

This project is an educational estimator and portfolio project focused on the intersection of mechanical engineering, sustainable infrastructure, and software engineering.
```

---

## 21. Future Features

After MVP, consider adding:

- User accounts and saved scenarios
- CSV export
- Real PDF generation
- More detailed chiller plant model
- Cost estimation
- ROI calculator for efficiency upgrades
- Mock IoT data stream
- Maintenance degradation simulation
- AI assistant that explains recommendations
- Benchmark mode for different facility types
- More detailed Green Mark readiness checklist
- Multilingual education mode

---

## 22. Risks and How to Handle Them

### Risk: Calculations are oversimplified

Mitigation:

- Be transparent.
- Label it as educational.
- Show assumptions clearly.

### Risk: Green Mark claims may be inaccurate

Mitigation:

- Do not claim official scoring.
- Use “readiness map” instead of “certification score.”
- Cite public references in README, not as legal compliance claims.

### Risk: Scope creep

Mitigation:

- Build PUE simulator first.
- Add WUE, carbon, recommendations, and learning mode after.
- Avoid auth/database until the core simulator is polished.

### Risk: Too technical for general users

Mitigation:

- Add tooltips.
- Add learning mode.
- Use plain-language explanations.

---

## 23. Definition of Done for MVP

The MVP is done when:

- User can open the landing page.
- User can start a simulation.
- User can adjust at least 8 core parameters.
- PUE updates live.
- Annual energy, carbon, and water estimates update live.
- User can compare three preset scenarios.
- App generates at least five meaningful recommendations.
- App includes a learning mode with at least four lessons.
- User can print or export a report.
- Disclaimer is visible.
- README explains assumptions and limitations.
- App is deployed publicly.

---

## 24. Suggested First Prompt for Coding Agent

Use this prompt to start implementation:

```text
Build the MVP of TropicalDC Lab using Next.js, TypeScript, Tailwind CSS, and Recharts. Start with a frontend-only app. Implement the landing page, simulator page, calculation library, live metric cards, control panel, and simple interactive data centre schematic. Use the formulas and types from this specification. Keep calculations transparent and add an educational disclaimer. Prioritize clean architecture, reusable components, and a polished UI suitable for a public portfolio project.
```

---

## 25. Product North Star

The app should make a hiring manager think:

> This person understands software, infrastructure, sustainability, systems thinking, and product execution.

That is the real goal of TropicalDC Lab.
