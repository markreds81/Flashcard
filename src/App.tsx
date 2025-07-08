import InlineMath from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Question } from "./types";

const defaultQuestions: Question[] = [
  {
    id: 1,
    question: `
      Quanto vale \\( \\frac{1}{2} + \\frac{3}{4} \\)?<br/>
      <img src="immagini/somma-frazioni.png" width="150" />
    `,
    answer: `
      Il risultato è \\( \\frac{5}{4} \\).<br/>
      <img src="immagini/risultato.png" width="100" />
    `,
    topic: "Frazioni",
    subject: "Matematica",
  },
  {
    id: 2,
    question: "Qual è la derivata di \\( \\sin(x) \\) ?",
    answer: "La derivata di \\( \\sin(x) \\) è \\( \\cos(x) \\)",
    topic: "Derivate",
    subject: "Analisi",
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    question: "",
    answer: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    window.questionAPI.load().then((data: Question[]) => {
      if (!data || data.length === 0) {
        setQuestions(defaultQuestions);
        // Popola il DB se vuoto
        Promise.all(defaultQuestions.map(q => window.questionAPI.add(q))).then(() => {
          window.questionAPI.load().then(setQuestions).finally(() => setLoading(false));
        });
      } else {
        setQuestions(data);
        setLoading(false);
      }
    }).catch(() => {
      setQuestions(defaultQuestions);
      setLoading(false);
    });
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.question.toLowerCase().includes(s) ||
      q.answer.toLowerCase().includes(s)
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
    if (!form.subject || !form.topic || !form.question || !form.answer)
      return;
    const nuovoQuestion = {
      ...form,
    };
    window.questionAPI.add(nuovoQuestion).then((q) => {
      setQuestions([q, ...questions]);
    });
    setForm({ subject: "", topic: "", question: "", answer: "" });
  };

  if (loading) {
    return (
      <div className="app-root" style={{ color: "var(--fg)", background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
        Caricamento quesiti...
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="app-detail">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="app-detail-back"
        >
          ← Back
        </button>
        <h2 className="app-detail-title">{selectedQuestion.subject} — {selectedQuestion.topic}</h2>
        <div className="app-detail-section">
          <span className="app-detail-label">Domanda:</span>
          <div style={{ marginTop: 8, marginBottom: 16 }}>{renderWithMath(selectedQuestion.question)}</div>
          <span className="app-detail-label">Risposta:</span>
          <div style={{ marginTop: 8 }}>{renderWithMath(selectedQuestion.answer)}</div>
        </div>
        <div className="app-detail-id">ID: {selectedQuestion.id}</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <h1 className="app-title">Elenco Quesiti</h1>
      <form onSubmit={handleSubmit} className="app-form">
        <div className="app-form-row">
          <select
            name="subject"
            value={form.subject}
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
            name="topic"
            placeholder="Argomento"
            value={form.topic}
            onChange={handleChange}
            className="app-form-input"
            required
          />
        </div>
        <div className="app-form-row">
          <textarea
            name="question"
            placeholder="Domanda (supporta LaTeX e HTML)"
            value={form.question}
            onChange={handleChange}
            className="app-form-textarea"
            required
            rows={2}
          />
          <textarea
            name="answer"
            placeholder="Risposta (supporta LaTeX e HTML)"
            value={form.answer}
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
          {filteredQuestions.map((q) => (
            <tr
              key={q.id}
              onClick={e => {
                if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                setSelectedQuestion(q);
              }}
              className="app-table-row"
            >
              <td>{q.id}</td>
              <td>{renderWithMath(q.question)}</td>
              <td>{renderWithMath(q.answer)}</td>
              <td style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  title="Rimuovi"
                  onClick={() => {
                    window.questionAPI.remove(q.id).then(() => {
                      window.questionAPI.load().then(setQuestions);
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
