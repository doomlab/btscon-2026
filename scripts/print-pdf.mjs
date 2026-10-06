// Print a rendered Quarto reveal.js deck to a one-file PDF with Google Chrome.
// No npm packages needed (Node 22+).
//
// usage: node scripts/print-pdf.mjs 03-zenodo-tutorial/zenodo.html
//   -> writes 03-zenodo-tutorial/zenodo.pdf

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, basename, extname, resolve } from "node:path";

const htmlPath = resolve(process.argv[2] ?? "");
if (extname(htmlPath) !== ".html") {
  console.error("usage: node scripts/print-pdf.mjs path/to/deck.html");
  process.exit(1);
}
const root = dirname(htmlPath);
const outPath = htmlPath.replace(/\.html$/, ".pdf");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// serve the deck folder (reveal.js only lays out print pages over http)
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const server = createServer(async (req, res) => {
  try {
    const file = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const httpPort = server.address().port;

// start headless Chrome with remote debugging
const debugPort = 9333;
const profile = await mkdtemp(join(tmpdir(), "chrome-print-"));
const proc = spawn(chrome, ["--headless=new", "--disable-gpu",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank"],
  { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try {
    const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    wsUrl = pages.find((p) => p.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(200);
}
if (!wsUrl) { console.error("Chrome did not start"); process.exit(1); }

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve) => {
  const mid = ++id; pending.set(mid, resolve);
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send("Page.enable");
await send("Page.navigate", { url: `http://127.0.0.1:${httpPort}/${basename(htmlPath)}?print-pdf` });
await sleep(6000); // let reveal.js build the print layout and load fonts/images

const res = await send("Page.printToPDF", {
  printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false,
});
ws.close(); proc.kill(); server.close();
if (!res.result) { console.error(JSON.stringify(res.error)); process.exit(1); }
await writeFile(outPath, Buffer.from(res.result.data, "base64"));
console.log("wrote", outPath);
