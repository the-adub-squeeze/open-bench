# Milestones + Colorado Springs Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public project-milestones section to the homepage and make Colorado Springs, Colorado unmistakable in copy so locals know Open Bench is for them.

**Architecture:** Keep milestones as static editorial data in `src/lib/milestones.ts` (no database or schema change). Render them with a focused `Milestones` presentational component that matches existing `block-card` / mono / border-2 visual language. Localize city copy through a shared `CITY` constant used by hero, meta, spaces, milestones, and footer — one source of truth so the city name never drifts.

**Tech Stack:** React 19, TanStack Router (file route `src/routes/index.tsx`), Tailwind v4 utilities already in `src/styles.css` (`block-card`, `grid-paper`), Vitest + Testing Library, TypeScript.

## Global Constraints

- City string must be exactly `Colorado Springs, Colorado` everywhere user-facing copy names the city.
- Do not edit `supabase/migrations/`, `drizzle/`, or generated files.
- Stay client-side / GitHub Pages compatible (no new server-only runtime).
- Preserve existing design tokens and patterns (`block-card`, `grid-paper`, Archivo / JetBrains Mono, 2px borders, `text-primary` accents) — do not restyle the whole site.
- Homepage section order after this work: Hero → Milestones → MoneyFlow → Ledger → Spaces → AfterOpening → footer.
- Milestone content is community-facing progress (not internal ops notes like RLS policies).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/city.ts` | Shared `CITY` / `CITY_SHORT` constants |
| `src/lib/milestones.ts` | Milestone type + ordered `MILESTONES` array |
| `src/components/milestones.tsx` | Presentational milestones section |
| `src/lib/city.test.ts` | Assert city string is exact |
| `src/lib/milestones.test.ts` | Assert milestone shape, order, statuses |
| `src/components/milestones.test.tsx` | Render statuses, city mention, section heading |
| `src/routes/index.tsx` | Wire `Milestones`, localize Hero / Spaces / meta / footer |
| `roadmap.md` | Record shipped milestones UI + city localization |

---

### Task 1: Shared city constant

**Files:**
- Create: `src/lib/city.ts`
- Test: `src/lib/city.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `export const CITY = "Colorado Springs, Colorado"` and `export const CITY_SHORT = "Colorado Springs"`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/city.test.ts
import { describe, expect, it } from "vitest";
import { CITY, CITY_SHORT } from "./city";

describe("city", () => {
  it("names Colorado Springs, Colorado for locals", () => {
    expect(CITY).toBe("Colorado Springs, Colorado");
    expect(CITY_SHORT).toBe("Colorado Springs");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/city.test.ts`
Expected: FAIL with cannot find module `./city` (or similar).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/city.ts
/** Full city label for user-facing copy. */
export const CITY = "Colorado Springs, Colorado";

/** Short city label when state is already clear from context. */
export const CITY_SHORT = "Colorado Springs";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/city.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/city.ts src/lib/city.test.ts
git commit -m "feat: add Colorado Springs city constants"
```

---

### Task 2: Milestones data module

**Files:**
- Create: `src/lib/milestones.ts`
- Test: `src/lib/milestones.test.ts`

**Interfaces:**
- Consumes: `CITY` from `src/lib/city.ts` (optional in descriptions; city may appear in copy)
- Produces:
  - `export type MilestoneStatus = "done" | "current" | "upcoming"`
  - `export type Milestone = { id: string; title: string; description: string; status: MilestoneStatus }`
  - `export const MILESTONES: readonly Milestone[]` — fixed order listed below

Milestone content (exact values):

1. `id: "site-ledger"`, status `done` — title `Public site & ledger live`, description `Neighbors can see every dollar in and out, and suggest spaces for a free shop.`
2. `id: "pick-space"`, status `current` — title `Colorado Springs picks the place`, description `Locals nominate sheds, garages, empty buildings, and more across Colorado Springs, Colorado. The most-backed spot sets our first funding goal.`
3. `id: "card-donations"`, status `upcoming` — title `Online donations open`, description `Secure card gifts land on the public ledger automatically the moment they clear.`
4. `id: "hit-goal"`, status `upcoming` — title `Hit the community goal`, description `We raise what the chosen Colorado Springs space needs to buy or lease — tracked in the open.`
5. `id: "secure-space"`, status `upcoming` — title `Secure the building`, description `Lease or purchase closes. Expenses and receipts post to the ledger.`
6. `id: "doors-open"`, status `upcoming` — title `Doors open`, description `Anyone in Colorado Springs can bring tools and materials. Community lockers keep gear safe overnight.`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/milestones.test.ts
import { describe, expect, it } from "vitest";
import { MILESTONES } from "./milestones";

describe("MILESTONES", () => {
  it("lists six community-facing steps in order", () => {
    expect(MILESTONES.map((m) => m.id)).toEqual([
      "site-ledger",
      "pick-space",
      "card-donations",
      "hit-goal",
      "secure-space",
      "doors-open",
    ]);
  });

  it("marks only one milestone as current", () => {
    expect(MILESTONES.filter((m) => m.status === "current")).toHaveLength(1);
    expect(MILESTONES.find((m) => m.status === "current")?.id).toBe("pick-space");
  });

  it("mentions Colorado Springs so locals know it is for them", () => {
    const blob = MILESTONES.map((m) => `${m.title} ${m.description}`).join(" ");
    expect(blob).toContain("Colorado Springs");
  });

  it("keeps done milestones before current, and current before upcoming", () => {
    const rank = { done: 0, current: 1, upcoming: 2 } as const;
    const ranks = MILESTONES.map((m) => rank[m.status]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/milestones.test.ts`
Expected: FAIL with cannot find module `./milestones`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/milestones.ts
export type MilestoneStatus = "done" | "current" | "upcoming";

export type Milestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
};

export const MILESTONES: readonly Milestone[] = [
  {
    id: "site-ledger",
    title: "Public site & ledger live",
    description:
      "Neighbors can see every dollar in and out, and suggest spaces for a free shop.",
    status: "done",
  },
  {
    id: "pick-space",
    title: "Colorado Springs picks the place",
    description:
      "Locals nominate sheds, garages, empty buildings, and more across Colorado Springs, Colorado. The most-backed spot sets our first funding goal.",
    status: "current",
  },
  {
    id: "card-donations",
    title: "Online donations open",
    description:
      "Secure card gifts land on the public ledger automatically the moment they clear.",
    status: "upcoming",
  },
  {
    id: "hit-goal",
    title: "Hit the community goal",
    description:
      "We raise what the chosen Colorado Springs space needs to buy or lease — tracked in the open.",
    status: "upcoming",
  },
  {
    id: "secure-space",
    title: "Secure the building",
    description:
      "Lease or purchase closes. Expenses and receipts post to the ledger.",
    status: "upcoming",
  },
  {
    id: "doors-open",
    title: "Doors open",
    description:
      "Anyone in Colorado Springs can bring tools and materials. Community lockers keep gear safe overnight.",
    status: "upcoming",
  },
] as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/milestones.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/milestones.ts src/lib/milestones.test.ts
git commit -m "feat: add Open Bench project milestones data"
```

---

### Task 3: Milestones UI component

**Files:**
- Create: `src/components/milestones.tsx`
- Test: `src/components/milestones.test.tsx`

**Interfaces:**
- Consumes: `MILESTONES`, `Milestone`, `MilestoneStatus` from `@/lib/milestones`; `CITY` from `@/lib/city`
- Produces: `export function Milestones(): JSX.Element` — section with `id="milestones"`

Status label map (exact):
- `done` → `Done`
- `current` → `Now`
- `upcoming` → `Next`

Visual rules (match homepage):
- Section: `border-b-2 border-border px-5 py-14`
- Inner: `mx-auto max-w-5xl`
- Heading: `Where we are in Colorado Springs`
- Subcopy: `A free makerspace for Colorado Springs, Colorado — here's the path from open ledger to open doors.`
- List: vertical stack `space-y-4`; each item `block-card p-5` with mono status badge
- Current item: add `ring-2 ring-primary` (or `border-primary` via class) so the active step stands out without new design language

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/milestones.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Milestones } from "./milestones";
import { MILESTONES } from "@/lib/milestones";

describe("Milestones", () => {
  it("renders the section heading and city for locals", () => {
    render(<Milestones />);
    expect(
      screen.getByRole("heading", { name: /where we are in colorado springs/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Colorado Springs, Colorado/i)).toBeInTheDocument();
  });

  it("renders every milestone title", () => {
    render(<Milestones />);
    for (const m of MILESTONES) {
      expect(screen.getByText(m.title)).toBeInTheDocument();
    }
  });

  it("exposes an anchor id for in-page links", () => {
    const { container } = render(<Milestones />);
    expect(container.querySelector("#milestones")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/milestones.test.tsx`
Expected: FAIL with cannot find module `./milestones`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/milestones.tsx
import { CITY } from "@/lib/city";
import { MILESTONES, type MilestoneStatus } from "@/lib/milestones";

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  done: "Done",
  current: "Now",
  upcoming: "Next",
};

export function Milestones() {
  return (
    <section id="milestones" className="border-b-2 border-border px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl">Where we are in Colorado Springs</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          A free makerspace for {CITY} — here's the path from open ledger to open doors.
        </p>
        <ol className="mt-8 space-y-4">
          {MILESTONES.map((m, index) => (
            <li
              key={m.id}
              className={
                m.status === "current"
                  ? "block-card p-5 ring-2 ring-primary"
                  : "block-card p-5"
              }
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-sm text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <h3 className="mt-2 text-xl">{m.title}</h3>
              <p className="mt-2 text-muted-foreground">{m.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/milestones.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/milestones.tsx src/components/milestones.test.tsx
git commit -m "feat: add milestones section component"
```

---

### Task 4: Localize homepage copy and wire Milestones

**Files:**
- Modify: `src/routes/index.tsx`
- Test: `src/routes/index.colorado.test.tsx` (copy assertions that do not need Supabase loaders)

**Interfaces:**
- Consumes: `Milestones` from `@/components/milestones`; `CITY` / `CITY_SHORT` from `@/lib/city`
- Produces: updated Index page composition and copy

Exact copy changes in `src/routes/index.tsx`:

1. **Route `head` meta**
   - title: `Open Bench — free makerspace in Colorado Springs, Colorado`
   - description: `Donate toward a free community makerspace in Colorado Springs, Colorado. Every dollar is logged on a public ledger, and neighbors pick the building.`
   - `og:title`: `Open Bench · Colorado Springs`
   - `og:description`: `A free makerspace for Colorado Springs, Colorado — funded by neighbors, tracked on a public ledger.`

2. **`Index` composition** — after `<Hero />` insert `<Milestones />`, then keep MoneyFlow / Ledger / Spaces / AfterOpening / footer.

3. **Hero eyebrow** (replace `Open Bench · Est. by neighbors`):
   - `Open Bench · {CITY}`

4. **Hero supporting paragraph** — append city so first viewport is clearly local:
   - `We're raising money in {CITY} to buy or lease a space where anyone can build, fix and make — for free, forever. Every dollar is logged in public. None of it goes in anyone's pocket.`

5. **Hero CTAs** — add a third link:
   - `<a href="#milestones" className="block-card px-6 py-3 font-bold transition-transform hover:-translate-y-0.5">See milestones</a>`

6. **Spaces intro** — replace the muted paragraph with:
   - `There's no fixed target yet. Know an empty shed in Old Colorado City, a garage off Academy, or an unused building anywhere in {CITY}? Add it. The most-backed spot becomes our first goal — and the space grows as we do.`

7. **Suggest form neighborhood placeholder**:
   - `placeholder="e.g. Old Colorado City, Briargate"`

8. **Suggest form title placeholder**:
   - `placeholder="Old firehouse near Tejon"`

9. **Footer**:
   - `Open Bench · {CITY} · Free forever. No memberships, no fees, no exceptions.`

Because `Index` loaders hit Supabase, do **not** full-render `Index` in tests. Instead extract the pure copy helpers OR assert against small exported fragments. Preferred approach for this task: export a `homeCopy` object from the route file (or a tiny `src/lib/home-copy.ts`) that Hero/Spaces/footer/`head` read from, and unit-test that object.

Recommended: create `src/lib/home-copy.ts`:

```ts
import { CITY, CITY_SHORT } from "./city";

export const homeCopy = {
  metaTitle: `Open Bench — free makerspace in ${CITY}`,
  metaDescription: `Donate toward a free community makerspace in ${CITY}. Every dollar is logged on a public ledger, and neighbors pick the building.`,
  ogTitle: `Open Bench · ${CITY_SHORT}`,
  ogDescription: `A free makerspace for ${CITY} — funded by neighbors, tracked on a public ledger.`,
  heroEyebrow: `Open Bench · ${CITY}`,
  heroBody: `We're raising money in ${CITY} to buy or lease a space where anyone can build, fix and make — for free, forever. Every dollar is logged in public. None of it goes in anyone's pocket.`,
  spacesIntro: `There's no fixed target yet. Know an empty shed in Old Colorado City, a garage off Academy, or an unused building anywhere in ${CITY}? Add it. The most-backed spot becomes our first goal — and the space grows as we do.`,
  neighborhoodPlaceholder: "e.g. Old Colorado City, Briargate",
  titlePlaceholder: "Old firehouse near Tejon",
  footer: `Open Bench · ${CITY} · Free forever. No memberships, no fees, no exceptions.`,
} as const;
```

Then wire `head`, Hero, Spaces, SuggestForm, and footer to `homeCopy` fields. Keep milestone component owning its own heading copy (already tested).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/home-copy.test.ts
import { describe, expect, it } from "vitest";
import { homeCopy } from "./home-copy";

describe("homeCopy", () => {
  it("puts Colorado Springs, Colorado in hero, meta, spaces, and footer", () => {
    const city = "Colorado Springs, Colorado";
    expect(homeCopy.metaTitle).toContain(city);
    expect(homeCopy.metaDescription).toContain(city);
    expect(homeCopy.ogDescription).toContain(city);
    expect(homeCopy.heroEyebrow).toContain(city);
    expect(homeCopy.heroBody).toContain(city);
    expect(homeCopy.spacesIntro).toContain(city);
    expect(homeCopy.footer).toContain(city);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/home-copy.test.ts`
Expected: FAIL with cannot find module `./home-copy`.

- [ ] **Step 3: Implement `home-copy.ts` and wire `index.tsx`**

Create `src/lib/home-copy.ts` with the object above.

In `src/routes/index.tsx`:
- Add imports:
  ```ts
  import { Milestones } from "@/components/milestones";
  import { homeCopy } from "@/lib/home-copy";
  ```
- Replace `head` meta strings with `homeCopy.metaTitle`, `homeCopy.metaDescription`, `homeCopy.ogTitle`, `homeCopy.ogDescription`.
- In `Index`, render `<Milestones />` immediately after `<Hero />`.
- Update Hero eyebrow, body, and add `#milestones` CTA using `homeCopy`.
- Update Spaces intro, SuggestForm placeholders, and footer using `homeCopy`.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/home-copy.test.ts src/components/milestones.test.tsx src/lib/milestones.test.ts src/lib/city.test.ts`
Expected: all PASS

Also run full suite: `npm test`
Expected: existing `app-routing` test still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/home-copy.ts src/lib/home-copy.test.ts src/routes/index.tsx
git commit -m "feat: show milestones and localize Open Bench for Colorado Springs"
```

---

### Task 5: Sync roadmap.md and smoke-check

**Files:**
- Modify: `roadmap.md`

- [ ] **Step 1: Update roadmap Done / Open**

Replace `roadmap.md` contents with:

```md
# Open Bench — roadmap

## Done
- Site: public ledger (raised / spent / balance, receipts), community space suggestions with voting, "once the doors open" section.
- Name set to Open Bench.
- Homepage milestones section (site → pick space → donations → goal → secure → open doors).
- Localized for Colorado Springs, Colorado across hero, meta, spaces, milestones, and footer.

## Open
- Card donations: user chose "site first, payments later". When enabled, each donation must land on the ledger automatically.
- Ledger writes: only the owner can add donations and expenses with receipts; no public write path.
```

- [ ] **Step 2: Manual smoke (dev server)**

Run: `npm run dev`
Open `/` and verify:
1. Hero eyebrow shows `Open Bench · Colorado Springs, Colorado`
2. `#milestones` section lists six steps; current step highlighted
3. Spaces copy and footer mention Colorado Springs
4. "See milestones" CTA scrolls to the section
5. Layout still works at mobile width (~375px) — stack, no horizontal overflow

Expected: all five checks pass.

- [ ] **Step 3: Lint + tests**

Run: `npm test && npm run lint`
Expected: PASS (or only pre-existing lint issues unrelated to these files).

- [ ] **Step 4: Commit**

```bash
git add roadmap.md
git commit -m "docs: mark milestones and Colorado Springs localization done"
```

---

## Self-Review Checklist

**Spec coverage**
- [x] Show project milestones → Tasks 2–4 (`MILESTONES` + `Milestones` + Index wire-up)
- [x] Include Colorado Springs, Colorado for locals → Tasks 1, 3, 4 (constant, milestone copy, hero/meta/spaces/footer)

**Placeholder scan:** none — all copy, file paths, commands, and code are concrete.

**Type consistency:** `MilestoneStatus` / `Milestone` / `MILESTONES` / `CITY` / `homeCopy` names match across tasks.

**Out of scope (intentionally):** payment provider integration, DB-backed milestones, schema changes, full visual redesign.
