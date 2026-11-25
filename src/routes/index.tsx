import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

const ledgerQuery = queryOptions({
  queryKey: ["ledger"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const spacesQuery = queryOptions({
  queryKey: ["spaces"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("space_suggestions")
      .select("*")
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Open Bench — a free makerspace, funded in the open" },
      { name: "description", content: "Donate toward a free community makerspace. Every dollar is logged on a public ledger, and the community picks the building." },
      { property: "og:title", content: "Open Bench" },
      { property: "og:description", content: "A free makerspace funded by neighbors, tracked on a public ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(ledgerQuery),
      context.queryClient.ensureQueryData(spacesQuery),
    ]),
  component: Index,
});

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const SPACE_TYPES = [
  { value: "shed", label: "Unused shed" },
  { value: "garage", label: "Garage" },
  { value: "house", label: "Empty house" },
  { value: "building", label: "Abandoned building" },
  { value: "warehouse", label: "Warehouse / big space" },
  { value: "other", label: "Something else" },
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <MoneyFlow />
      <Ledger />
      <Spaces />
      <AfterOpening />
      <footer className="border-t-2 border-border px-5 py-8 text-center text-sm text-muted-foreground">
        Open Bench · Free forever. No memberships, no fees, no exceptions.
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <section className="grid-paper border-b-2 border-border px-5 pb-14 pt-10 md:pt-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Open Bench · Est. by neighbors
        </p>
        <h1 className="mt-4 text-5xl leading-[0.95] md:text-8xl">
          A free shop.<br />
          <span className="text-primary">Built by everyone.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg">
          We're raising money to buy or lease a space where anyone can build, fix and make — for free, forever.
          Every dollar is logged in public. None of it goes in anyone's pocket.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#donate" className="block-card bg-primary px-6 py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
            Chip in
          </a>
          <a href="#spaces" className="block-card px-6 py-3 font-bold transition-transform hover:-translate-y-0.5">
            Suggest a space
          </a>
        </div>
      </div>
    </section>
  );
}

function MoneyFlow() {
  const steps = [
    { n: "01", t: "You donate", d: "Your gift is logged on the public ledger below with the date and amount, the moment it lands." },
    { n: "02", t: "It's held for the space", d: "Funds are only spent on buying or leasing the building, and setup like lockers and benches." },
    { n: "03", t: "Every expense is shown", d: "Each payment out is posted with a receipt. Anyone can add it all up and check our math." },
  ];
  return (
    <section id="donate" className="border-b-2 border-border px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl">Where your money goes</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="block-card p-5">
              <span className="font-mono text-sm text-primary">{s.n}</span>
              <h3 className="mt-2 text-xl">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 block-card bg-accent p-5 text-accent-foreground">
          <p className="font-bold">Online donations open soon.</p>
          <p className="mt-1 text-sm">We're setting up secure card payments. Each one will appear on the ledger automatically.</p>
        </div>
      </div>
    </section>
  );
}

function Ledger() {
  const { data } = useSuspenseQuery(ledgerQuery);
  const raised = data.filter((e) => e.kind === "donation").reduce((a, e) => a + e.amount_cents, 0);
  const spent = data.filter((e) => e.kind === "expense").reduce((a, e) => a + e.amount_cents, 0);
  return (
    <section className="border-b-2 border-border bg-secondary px-5 py-14 text-secondary-foreground">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl">The public ledger</h2>
        <p className="mt-2 max-w-xl opacity-80">Every dollar in, every dollar out. Nothing is hidden or edited after the fact.</p>
        <div className="mt-8 grid grid-cols-3 gap-3 font-mono">
          {[["Raised", raised], ["Spent", spent], ["Balance", raised - spent]].map(([l, v]) => (
            <div key={l as string} className="border-2 border-secondary-foreground/30 p-4">
              <div className="text-xs uppercase tracking-widest opacity-70">{l}</div>
              <div className="mt-1 text-xl md:text-3xl">{usd(v as number)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-2 border-secondary-foreground/30 font-mono text-sm">
          {data.length === 0 ? (
            <p className="p-5 opacity-70">No entries yet. The first donation will show up right here.</p>
          ) : (
            data.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 border-b border-secondary-foreground/20 px-4 py-3 last:border-0">
                <span className="opacity-60">{new Date(e.created_at).toLocaleDateString()}</span>
                <span className="flex-1 truncate">{e.label}</span>
                {e.receipt_url && <a href={e.receipt_url} className="underline" target="_blank" rel="noreferrer">receipt</a>}
                <span className={e.kind === "donation" ? "text-accent" : "text-primary"}>
                  {e.kind === "donation" ? "+" : "−"}{usd(e.amount_cents)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Spaces() {
  const { data } = useSuspenseQuery(spacesQuery);
  const qc = useQueryClient();
  const [voted, setVoted] = useState<string[]>([]);
  const vote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("upvote_space", { _id: id });
      if (error) throw error;
    },
    onSuccess: (_, id) => { setVoted((v) => [...v, id]); qc.invalidateQueries({ queryKey: ["spaces"] }); },
  });
  return (
    <section id="spaces" className="border-b-2 border-border px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl">You pick the place.<br /><span className="text-primary">That sets the goal.</span></h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          There's no fixed target yet. Know an empty shed, an abandoned building, or an uncle's heated garage that never gets used?
          Add it. The most-backed spot becomes our first goal — and the space grows as we do.
        </p>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <SuggestForm />
          <div className="space-y-4">
            {data.length === 0 && <p className="block-card p-5 text-muted-foreground">No suggestions yet. Be the first.</p>}
            {data.map((s) => (
              <article key={s.id} className="block-card flex gap-4 p-4">
                <button
                  onClick={() => vote.mutate(s.id)}
                  disabled={voted.includes(s.id)}
                  className="flex h-16 w-14 shrink-0 flex-col items-center justify-center border-2 border-border font-mono hover:bg-primary hover:text-primary-foreground disabled:bg-primary disabled:text-primary-foreground"
                  aria-label={`Back ${s.title}`}
                >
                  <span>▲</span><span className="font-bold">{s.votes}</span>
                </button>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase text-muted-foreground">
                    {SPACE_TYPES.find((t) => t.value === s.space_type)?.label ?? "Space"}{s.neighborhood && ` · ${s.neighborhood}`}
                  </p>
                  <h3 className="text-lg">{s.title}</h3>
                  {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {s.estimated_cost != null && <>Est. {usd(s.estimated_cost * 100)} · </>}from {s.submitted_by}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SuggestForm() {
  const qc = useQueryClient();
  const [done, setDone] = useState(false);
  const add = useMutation({
    mutationFn: async (f: FormData) => {
      const cost = String(f.get("cost") ?? "").replace(/[^0-9]/g, "");
      const { error } = await supabase.from("space_suggestions").insert({
        title: String(f.get("title")).trim(),
        space_type: String(f.get("type")),
        neighborhood: String(f.get("area") ?? "").trim(),
        description: String(f.get("desc") ?? "").trim(),
        estimated_cost: cost ? Number(cost) : null,
        submitted_by: String(f.get("name") ?? "").trim() || "A neighbor",
      });
      if (error) throw error;
    },
    onSuccess: () => { setDone(true); qc.invalidateQueries({ queryKey: ["spaces"] }); },
  });
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    add.mutate(new FormData(form), { onSuccess: () => form.reset() });
  };
  const field = "mt-1 w-full border-2 border-input bg-background px-3 py-2 outline-none focus:border-primary";
  return (
    <form onSubmit={onSubmit} className="block-card h-fit space-y-3 p-5">
      <h3 className="text-xl">Suggest a space</h3>
      <label className="block text-sm font-semibold">What is it?
        <input name="title" required minLength={3} maxLength={120} placeholder="Old fire station on 5th" className={field} />
      </label>
      <label className="block text-sm font-semibold">Type
        <select name="type" className={field}>{SPACE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
      </label>
      <label className="block text-sm font-semibold">Neighborhood
        <input name="area" maxLength={120} className={field} />
      </label>
      <label className="block text-sm font-semibold">Why it'd work
        <textarea name="desc" maxLength={1000} rows={3} className={field} />
      </label>
      <label className="block text-sm font-semibold">Rough cost to buy or lease ($, optional)
        <input name="cost" inputMode="numeric" className={field} />
      </label>
      <label className="block text-sm font-semibold">Your name (optional)
        <input name="name" maxLength={60} className={field} />
      </label>
      <button disabled={add.isPending} className="w-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">
        {add.isPending ? "Adding…" : "Add it to the map"}
      </button>
      {done && <p className="text-sm font-semibold text-primary">Thanks! Your spot is on the list.</p>}
      {add.isError && <p className="text-sm text-destructive">Couldn't add that. Try again.</p>}
    </form>
  );
}

function AfterOpening() {
  const items = [
    ["Bring your tools", "Saws, sewing machines, soldering irons — share what you have, use what others bring."],
    ["Bring your materials", "Scrap wood, fabric, parts. One person's leftovers are another's project."],
    ["Lock it up", "Community-funded lockers so you can leave your gear at the end of the day."],
    ["Open to anyone", "No membership, no fees, no sign-up wall. Ever."],
  ];
  return (
    <section className="grid-paper px-5 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-5xl">Once the doors open</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {items.map(([t, d]) => (
            <div key={t} className="block-card p-5">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
