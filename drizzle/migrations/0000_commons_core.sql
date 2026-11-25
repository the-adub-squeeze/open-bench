CREATE TABLE public.space_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  space_type text NOT NULL DEFAULT 'other',
  neighborhood text NOT NULL DEFAULT '' CHECK (char_length(neighborhood) <= 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  estimated_cost integer CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  submitted_by text NOT NULL DEFAULT 'A neighbor' CHECK (char_length(submitted_by) <= 60),
  votes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.space_suggestions TO anon, authenticated;
GRANT ALL ON public.space_suggestions TO service_role;
ALTER TABLE public.space_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view suggestions" ON public.space_suggestions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can suggest" ON public.space_suggestions FOR INSERT TO anon, authenticated WITH CHECK (votes = 0);

CREATE OR REPLACE FUNCTION public.upvote_space(_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.space_suggestions SET votes = votes + 1 WHERE id = _id;
$$;
GRANT EXECUTE ON FUNCTION public.upvote_space(uuid) TO anon, authenticated;

CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('donation','expense')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  label text NOT NULL,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ledger_entries TO anon, authenticated;
GRANT ALL ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ledger is public" ON public.ledger_entries FOR SELECT TO anon, authenticated USING (true);