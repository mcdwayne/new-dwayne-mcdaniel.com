// Copies the built game into the app. Run `python3 build.py` at the repo root first.
const fs = require("fs"), path = require("path");
const src = path.join(__dirname, "..", "index.html");
if (!fs.existsSync(src)) { console.error("index.html not found: run `python3 build.py` in the repo root"); process.exit(1); }
fs.mkdirSync(path.join(__dirname, "web"), { recursive: true });
fs.copyFileSync(src, path.join(__dirname, "web", "index.html"));
console.log("copied index.html into app/web/");
