/**
 * Local static file server for this portfolio.
 * Usage:  node server.js
 * Then open http://localhost:8000/
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 8000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  if (relative === "work" || relative === "work/") relative = "work.html";
  const resolved = path.resolve(ROOT, relative);
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || "/");
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const target = stat.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;

    fs.stat(target, (innerErr, fileStat) => {
      if (innerErr || !fileStat.isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(target).toLowerCase();
      const mime = MIME[ext] || "application/octet-stream";
      const size = fileStat.size;
      const range = req.headers.range;

      if (range) {
        const match = range.match(/bytes=(\d*)-(\d*)/);
        const start = match && match[1] ? Number(match[1]) : 0;
        const end = match && match[2] ? Number(match[2]) : size - 1;
        if (start >= size || end >= size || start > end) {
          res.writeHead(416, { "Content-Range": `bytes */${size}` });
          res.end();
          return;
        }
        res.writeHead(206, {
          "Content-Type": mime,
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
        });
        fs.createReadStream(target, { start, end }).pipe(res);
        return;
      }

      res.writeHead(200, {
        "Content-Type": mime,
        "Content-Length": size,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(target).pipe(res);
    });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Serving ${ROOT}`);
  console.log(`Open http://localhost:${PORT}/`);
});
