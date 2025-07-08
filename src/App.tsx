import InlineMath from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Quesito } from "./types";

const quesiti_def: Quesito[] = [
  {
    id: 1,
    domanda: `
      Quanto vale \\( \\frac{1}{2} + \\frac{3}{4} \\)?<br/>
      <img src="immagini/somma-frazioni.png" width="150" />
    `,
    risposta: `
      Il risultato è \\( \\frac{5}{4} \\).<br/>
      <img src="immagini/risultato.png" width="100" />
    `,
    argomento: "Frazioni",
    materia: "Matematica",
  },
  {
    id: 2,
    domanda: "Qual è la derivata di \\( \\sin(x) \\) ?",
    risposta: "La derivata di \\( \\sin(x) \\) è \\( \\cos(x) \\)",
    argomento: "Derivate",
    materia: "Analisi",
  },
];

function renderWithMath(content: string) {
  // Trova ed evidenzia parti tra \\( ... \\) per usarle come InlineMath
  const parts = content.split(/(\\\(.*?\\\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("\\(") && part.endsWith("\\)")) {
      const latex = part.slice(2, -2);
      return <InlineMath key={index} math={latex} />;
    } else {
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    }
  });
}

function App() {
  const [quesitiState, setQuesitiState] = useState<Quesito[]>([]);
  const [form, setForm] = useState({
    materia: "",
    argomento: "",
    domanda: "",
    risposta: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuesito, setSelectedQuesito] = useState<Quesito | null>(null);

  useEffect(() => {
    window.quesitiAPI.load().then((data: Quesito[]) => {
      if (!data || data.length === 0) {
        setQuesitiState(quesiti_def);
        // Popola il DB se vuoto
        Promise.all(quesiti_def.map(q => window.quesitiAPI.add(q))).then(() => {
          window.quesitiAPI.load().then(setQuesitiState).finally(() => setLoading(false));
        });
      } else {
        setQuesitiState(data);
        setLoading(false);
      }
    }).catch(() => {
      setQuesitiState(quesiti_def);
      setLoading(false);
    });
  }, []);

  const filteredQuesiti = quesitiState.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.domanda.toLowerCase().includes(s) ||
      q.risposta.toLowerCase().includes(s)
    );
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materia || !form.argomento || !form.domanda || !form.risposta)
      return;
    const nuovoQuesito = {
      ...form,
    };
    window.quesitiAPI.add(nuovoQuesito).then((q) => {
      setQuesitiState([q, ...quesitiState]);
    });
    setForm({ materia: "", argomento: "", domanda: "", risposta: "" });
  };

  if (loading) {
    return (
      <div className="app-root" style={{ color: "var(--fg)", background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
        Caricamento quesiti...
      </div>
    );
  }

  if (selectedQuesito) {
    return (
      <div className="app-detail">
        <button
          onClick={() => setSelectedQuesito(null)}
          className="app-detail-back"
        >
          ← Back
        </button>
        <h2 className="app-detail-title">{selectedQuesito.materia} — {selectedQuesito.argomento}</h2>
        <div className="app-detail-section">
          <span className="app-detail-label">Domanda:</span>
          <div style={{ marginTop: 8, marginBottom: 16 }}>{renderWithMath(selectedQuesito.domanda)}</div>
          <span className="app-detail-label">Risposta:</span>
          <div style={{ marginTop: 8 }}>{renderWithMath(selectedQuesito.risposta)}</div>
        </div>
        <div className="app-detail-id">ID: {selectedQuesito.id}</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <h1 className="app-title">Elenco Quesiti</h1>
      <form onSubmit={handleSubmit} className="app-form">
        <div className="app-form-row">
          <select
            name="materia"
            value={form.materia}
            onChange={handleChange}
            className="app-form-select"
            required
          >
            <option value="" disabled>
              Materia
            </option>
            <option value="Analisi Matematica">Analisi Matematica</option>
            <option value="Altro">Altro</option>
          </select>
          <input
            name="argomento"
            placeholder="Argomento"
            value={form.argomento}
            onChange={handleChange}
            className="app-form-input"
            required
          />
        </div>
        <div className="app-form-row">
          <textarea
            name="domanda"
            placeholder="Domanda (supporta LaTeX e HTML)"
            value={form.domanda}
            onChange={handleChange}
            className="app-form-textarea"
            required
            rows={2}
          />
          <textarea
            name="risposta"
            placeholder="Risposta (supporta LaTeX e HTML)"
            value={form.risposta}
            onChange={handleChange}
            className="app-form-textarea"
            required
            rows={2}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="app-form-submit">
            Aggiungi
          </button>
        </div>
      </form>
      <div className="app-search-row">
        <div className="app-search-box">
          <input
            type="text"
            placeholder="Cerca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Reset"
              className="app-search-reset"
            >
              &#10006;
            </button>
          )}
        </div>
      </div>
      <table className="app-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Domanda</th>
            <th>Risposta</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredQuesiti.map((q) => (
            <tr
              key={q.id}
              onClick={e => {
                if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                setSelectedQuesito(q);
              }}
              className="app-table-row"
            >
              <td>{q.id}</td>
              <td>{renderWithMath(q.domanda)}</td>
              <td>{renderWithMath(q.risposta)}</td>
              <td style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  title="Rimuovi"
                  onClick={() => {
                    window.quesitiAPI.remove(q.id).then(() => {
                      window.quesitiAPI.load().then(setQuesitiState);
                    });
                  }}
                  className="app-table-remove"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
