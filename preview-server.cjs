const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = 4173;
const root = __dirname;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || "/").split("?")[0]);
  const normalizedPath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const candidatePaths = [normalizedPath];

  if (!path.extname(normalizedPath)) {
    candidatePaths.push(`${normalizedPath}.html`);
    candidatePaths.push(path.join(normalizedPath, "index.html"));
  }

  const nextCandidate = (index) => {
    if (index >= candidatePaths.length) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    let filePath = path.join(root, candidatePaths[index]);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        nextCandidate(index + 1);
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      fs.readFile(filePath, (readError, data) => {
        if (readError) {
          response.writeHead(500);
          response.end("Server error");
          return;
        }

        response.writeHead(200, {
          "Content-Type":
            mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        });
        response.end(data);
      });
    });
  };

  nextCandidate(0);
});

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}`);
});
