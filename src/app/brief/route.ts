import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * "WorkProof: the brief and the build" as a web page. `npm run brief` writes public/brief.html from
 * the same facts as /for-judges, and the PDF of it to public/brief.pdf (served at /brief.pdf). Its
 * screenshots sit in public/brief-assets, which the page links relative to /brief.
 */
export async function GET() {
  const html = await readFile(join(process.cwd(), "public", "brief.html"), "utf8");
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
