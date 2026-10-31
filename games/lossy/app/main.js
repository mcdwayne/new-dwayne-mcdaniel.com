// LossyInc Range desktop shell. Loads the same single-file game the website serves.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: "#1A1A2E",
    title: "LossyInc Range",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.loadFile(path.join(__dirname, "web", "index.html"));
  // Links to the docs open in the user's browser, never inside the game window.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); } });
}

const template = [
  ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
  { label: "Game", submenu: [{ role: "reload", label: "Restart page" }, { role: "togglefullscreen" }, { type: "separator" }, { role: "quit" }] },
  { label: "View", submenu: [{ role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }] },
  { label: "Help", submenu: [{ label: "GitGuardian docs", click: () => shell.openExternal("https://docs.gitguardian.com") }] },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
