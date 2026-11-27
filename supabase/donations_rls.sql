-- Community donations: allow anyone to INSERT donation rows only.
-- Run once in Supabase → SQL Editor on project qqumfibvqtuifouhzgkt.
-- Expenses stay owner-only (service role / dashboard).

GRANT INSERT ON public.ledger_entries TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can log a donation" ON public.ledger_entries;
CREATE POLICY "Anyone can log a donation"
  ON public.ledger_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    kind = 'donation'
    AND amount_cents > 0
    AND amount_cents <= 100000000
    AND char_length(label) BETWEEN 1 AND 200
    AND receipt_url IS NULL
  );
