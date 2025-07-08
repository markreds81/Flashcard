# Flashcard Quesiti App (React + Electron + SQLite)

Questa applicazione è un gestore di flashcard (quesiti) con supporto a LaTeX, immagini, ricerca e persistenza sicura su database locale. È pensata per studenti e docenti che vogliono creare, consultare e gestire domande/risposte in modo semplice e moderno.

## Funzionalità principali

- **Visualizza, aggiungi, cerca e rimuovi quesiti** (domanda/risposta, materia, argomento)
- **Supporto a LaTeX** (rendering matematico) e immagini in domanda/risposta
- **UI moderna, responsive, dark mode**
- **Dettaglio quesito**: clicca una riga per vedere domanda/risposta in grande, con pulsante "Back"
- **Ricerca live** e reset rapido
- **Persistenza robusta**: i dati sono salvati in un database SQLite locale nella cartella utente (cross-platform)
- **Sicurezza**: la comunicazione tra UI e database avviene solo tramite IPC (Electron preload)

## Struttura del progetto

- `src/` — Frontend React (UI, logica, stili)
  - `App.tsx` — Tutta la logica e la UI principale
  - `types.ts` — Tipi TypeScript condivisi (Quesito, API)
  - `App.css` — Stili centralizzati (dark mode, responsive)
- `electron/` — Main e preload Electron
  - `main.ts` — Main process: crea la finestra, gestisce il database SQLite, IPC
  - `preload.ts` — Espone API sicure (`quesitiAPI`) al renderer tramite contextBridge
- `dist-electron/` — Output build main/preload
- `public/` — Asset statici (icone, immagini)
- `vite.config.ts` — Configurazione Vite (React + Electron, gestione moduli nativi)

## Come funziona

- All'avvio, l'app carica i quesiti dal database SQLite locale (se vuoto, inserisce alcuni esempi)
- Puoi aggiungere un quesito compilando il form: supporta LaTeX e immagini HTML
- Puoi cercare tra i quesiti in tempo reale
- Puoi rimuovere un quesito con il pulsante 🗑️
- Cliccando una riga vedi il dettaglio completo
- Tutte le operazioni di salvataggio/caricamento avvengono tramite IPC sicuro (mai accesso diretto dal renderer al filesystem)

## Avvio rapido

1. Installa le dipendenze:
   ```sh
   npm install
   ```
2. Avvia in modalità sviluppo:
   ```sh
   npm run dev
   ```
3. Per buildare l'app:
   ```sh
   npm run build
   npm run build:electron
   ```

## Note tecniche
- Il main process non viene bundlato con i moduli nativi (vedi vite.config.ts, sezione `external`)
- Tutti i tipi sono centralizzati in `src/types.ts` e disponibili globalmente
- Il database viene creato in modo sicuro nella cartella `userData` di Electron (cross-platform)

---

> Progetto sviluppato con React, Electron, Vite, TypeScript, better-sqlite3.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
