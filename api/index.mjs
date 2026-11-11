// Vercel Serverless Function Entrypoint
import { handler } from "../src/app.mjs";

export default async function vercelHandler(req, res) {
  return handler(req, res);
}
