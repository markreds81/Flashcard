import { app, BrowserWindow, ipcMain } from 'electron'
// @ts-ignore
import { fileURLToPath } from 'node:url'
// @ts-ignore
import path from 'node:path'
import Database from 'better-sqlite3'

// Patch for CJS/ESM compatibility: define __filename and __dirname for dependencies that expect them
// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
// @ts-ignore
const __dirname = path.dirname(__filename)
// @ts-ignore
globalThis.__filename = __filename
// @ts-ignore
globalThis.__dirname = __dirname

const dbPath = path.join(app.getPath('userData'), 'flashcard.sqlite')
const db = new Database(dbPath)

db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domanda TEXT NOT NULL,
    risposta TEXT NOT NULL,
    argomento TEXT NOT NULL,
    materia TEXT NOT NULL
  )
`).run()

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

ipcMain.handle('load-questions', () => {
  return db.prepare('SELECT * FROM questions ORDER BY id DESC').all()
})

ipcMain.handle('add-question', (_event, q) => {
  const stmt = db.prepare('INSERT INTO questions (question, answer, topic, subject) VALUES (?, ?, ?, ?)')
  const info = stmt.run(q.question, q.answer, q.topic, q.subject)
  return { ...q, id: info.lastInsertRowid }
})

ipcMain.handle('remove-question', (_event, id) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(id)
  return true
})
