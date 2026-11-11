// Run the idempotent bootstrap seed once and exit.
// Usage: npm run seed
import { seed } from "../src/db/seed.mjs";

await seed();
console.log("seed complete");
