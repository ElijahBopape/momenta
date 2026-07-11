import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { config } from "dotenv";

config({ path: path.join(import.meta.dirname, "..", ".env.local") });

const migrationsDir = path.join(import.meta.dirname, "..", "supabase", "migrations");

const rawConnectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
if (!rawConnectionString) {
  throw new Error("POSTGRES_URL_NON_POOLING (or POSTGRES_URL) is not set — pull env vars with `vercel env pull`.");
}
const connectionUrl = new URL(rawConnectionString);
connectionUrl.searchParams.delete("sslmode");

const client = new Client({ connectionString: connectionUrl.toString(), ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  create table if not exists public._migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  );
`);

const { rows: applied } = await client.query("select name from public._migrations");
const appliedNames = new Set(applied.map((r) => r.name));

const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (appliedNames.has(file)) {
    console.log(`skip  ${file} (already applied)`);
    continue;
  }
  const sql = await readFile(path.join(migrationsDir, file), "utf8");
  console.log(`apply ${file}`);
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("insert into public._migrations (name) values ($1)", [file]);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  }
}

await client.end();
console.log("done");
