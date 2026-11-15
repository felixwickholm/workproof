/**
 * Builds "WorkProof: the brief and the build" from the modules that hold every claim and number.
 *
 *   npm run brief
 *
 * 1. Loads src/app/for-judges/facts.ts, evidence.ts and site.ts through jiti (installed with the
 *    Tailwind toolchain), with the "@/" alias pointing at src/.
 * 2. Writes public/brief.html (served at /brief by src/app/brief/route.ts) and copies the screenshots
 *    it shows from docs/images to public/brief-assets/.
 * 3. Prints public/brief.html to public/brief.pdf (A4, tagged, with an outline) with Playwright.
 *    `npm run brief` fetches Playwright with npx, as `npm run eval:e2e` does. BRIEF_SKIP_PDF=1 skips it.
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { ASSET_DIR, buildBrief, IMAGES, TITLE } from "../docs/brief/brief.mjs";
import { loadPlaywright } from "../evals/e2e/harness.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": join(root, "src") } });

const facts = await jiti.import(join(root, "src/app/for-judges/facts.ts"));
const evidence = await jiti.import(join(root, "src/app/for-judges/evidence.ts"));
const site = await jiti.import(join(root, "src/app/for-judges/site.ts"));
const css = await readFile(join(root, "docs/brief/brief.css"), "utf8");

const html = buildBrief({ facts, evidence, site, css });
const htmlPath = join(root, "public/brief.html");
await writeFile(htmlPath, html);
await mkdir(join(root, "public", ASSET_DIR), { recursive: true });
for (const file of Object.values(IMAGES)) {
  await copyFile(join(root, "docs/images", file), join(root, "public", ASSET_DIR, file));
}
console.log(`wrote public/brief.html and public/${ASSET_DIR}/`);

if (process.env.BRIEF_SKIP_PDF !== "1") {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    const pdfPath = join(root, "public/brief.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-family:Helvetica Neue,Arial,sans-serif;font-size:8px;color:#4a5468;padding:0 15mm;display:flex;justify-content:space-between"><span>${TITLE}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    console.log("wrote public/brief.pdf");
  } finally {
    await browser.close();
  }
}
