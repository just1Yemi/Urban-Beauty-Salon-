// Tiny static server for _site with Netlify-style pretty URLs (used by shots.js and lh.js).
// startServer() resolves to a listening http.Server on 127.0.0.1 and a random free port.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const siteDir = path.join(root, "_site");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm",
  ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json",
};

export function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const p = urlPath.replace(/^\/+/, "");
    const candidates = p === "" || p.endsWith("/") ? [p + "index.html"] : [p, p + ".html", p + "/index.html"];
    for (const c of candidates) {
      const f = path.resolve(siteDir, c);
      if (!f.startsWith(siteDir)) break;
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        const buf = fs.readFileSync(f);
        res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] ?? "application/octet-stream", "Content-Length": buf.length });
        return res.end(buf);
      }
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}
