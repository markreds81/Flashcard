import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Database from "better-sqlite3";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;
const dbPath = path.join(app.getPath("userData"), "quesiti.sqlite");
const db = new Database(dbPath);
db.prepare(`
  CREATE TABLE IF NOT EXISTS quesiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domanda TEXT NOT NULL,
    risposta TEXT NOT NULL,
    argomento TEXT NOT NULL,
    materia TEXT NOT NULL
  )
`).run();
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.handle("load-quesiti", () => {
  return db.prepare("SELECT * FROM quesiti ORDER BY id DESC").all();
});
ipcMain.handle("add-quesito", (_event, q) => {
  const stmt = db.prepare("INSERT INTO quesiti (domanda, risposta, argomento, materia) VALUES (?, ?, ?, ?)");
  const info = stmt.run(q.domanda, q.risposta, q.argomento, q.materia);
  return { ...q, id: info.lastInsertRowid };
});
ipcMain.handle("remove-quesito", (_event, id) => {
  db.prepare("DELETE FROM quesiti WHERE id = ?").run(id);
  return true;
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
