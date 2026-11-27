/**
 * Prints the SQL to enable community donation inserts.
 * Apply in Supabase → SQL Editor (service role / dashboard), not via the anon key.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve("supabase/donations_rls.sql"), "utf8");
console.log(sql);
console.log("\n# Paste the SQL above into https://supabase.com/dashboard/project/qqumfibvqtuifouhzgkt/sql/new and Run.");
