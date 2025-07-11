import InlineMath from "@matejmazur/react-katex";
import { useState, useEffect, useRef } from "react";
import { Question } from "@/types";
import "katex/dist/katex.min.css";
import "./App.css";
import { Delete, File, FilePlus, ListRestart, Trash } from "lucide-react";
import QuestionForm from "@/components/QuestionForm";

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
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\))/g);
  // Split by $$...$$, $...$, and \( ... \) for inline math

  return parts.map((part, index) => {
    const isMath =
      (part.startsWith("\\(") && part.endsWith("\\)")) ||
      (part.startsWith("$") && part.endsWith("$"));

    if (isMath) {
      const latex = part
        .replace(/^\\\(/, "")
        .replace(/\\\)$/, "")
        .replace(/^\$/, "")
        .replace(/\$$/, "");
      return <InlineMath key={index} math={latex} />;
    } else {
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    }
  });
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [showDetail, setShowDetail] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    window.flashcardAPI
      .load()
      .then((data: Question[]) => {
        if (!data || data.length === 0) {
          setQuestions(defaultQuestions);
          // Popola il DB se vuoto
          Promise.all(
            defaultQuestions.map((q) => window.flashcardAPI.add(q))
          ).then(() => {
            window.flashcardAPI
              .load()
              .then(setQuestions)
              .finally(() => setLoading(false));
          });
        } else {
          setQuestions(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setQuestions(defaultQuestions);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!showDetail && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showDetail]);

  const filteredQuestions = questions.filter((q) => {
    const terms = search
      .toLowerCase()
      .split(/\s+/) // divide per spazi
      .filter(Boolean); // rimuove stringhe vuote

    return terms.every((term) => {
      const pattern = new RegExp(`\\b${term}`, "i"); // inizio parola
      return pattern.test(q.question) || pattern.test(q.answer);
    });
  });

  const handleSubmit = async (
    newQuestion: Omit<Question, "id">
  ): Promise<boolean> => {
    try {
      await window.flashcardAPI.add(newQuestion);
      const updated = await window.flashcardAPI.load();
      setQuestions(updated);
      return true;
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div
        className="app-root"
        style={{
          color: "var(--fg)",
          background: "var(--bg)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
        }}
      >
        Caricamento quesiti...
      </div>
    );
  }

  if (showDetail && selectedQuestion) {
    return (
      <div className="app-detail">
        <button
          onClick={() => setShowDetail(false)}
          className="app-detail-back"
        >
          ← Back
        </button>
        <h2 className="app-detail-title">
          {selectedQuestion.subject} — {selectedQuestion.topic}
        </h2>
        <div className="app-detail-section">
          <span className="app-detail-label">Domanda:</span>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {renderWithMath(selectedQuestion.question)}
          </div>
          {selectedQuestion.qimg_data && selectedQuestion.qimg_mime && (
            <img
              src={`data:${
                selectedQuestion.qimg_mime
              };base64,${arrayBufferToBase64(selectedQuestion.qimg_data)}`}
              alt="Immagine domanda"
              style={{
                marginTop: 8,
                marginBottom: 16,
                maxWidth: "100%",
                height: "auto",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          )}
          <span className="app-detail-label">Risposta:</span>
          <div style={{ marginTop: 8 }}>
            {renderWithMath(selectedQuestion.answer)}
          </div>
          {selectedQuestion.aimg_data && selectedQuestion.aimg_mime && (
            <img
              src={`data:${
                selectedQuestion.aimg_mime
              };base64,${arrayBufferToBase64(selectedQuestion.aimg_data)}`}
              alt="Immagine risposta"
              style={{
                marginTop: 8,
                marginBottom: 16,
                maxWidth: "100%",
                height: "auto",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          )}
        </div>
        <div className="app-detail-id">ID: {selectedQuestion.id}</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <h1 className="app-title">Elenco Quesiti</h1>
      <QuestionForm
        open={isPopupOpen}
        onOpenChange={setPopupOpen}
        onSubmit={handleSubmit}
      />
      <div className="app-search-row">
        <div className="app-buttons">
          <button type="button" onClick={() => setPopupOpen(true)}>
            <FilePlus />
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setLoading(true);
              setSelectedQuestion(null);
              window.flashcardAPI
                .load()
                .then(setQuestions)
                .finally(() => setLoading(false));
            }}
          >
            <ListRestart />
          </button>
        </div>
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
              <Delete />
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
            <th style={{ width: 40 }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuestions.map((q) => (
            <tr
              key={q.id}
              onClick={() => {
                setSelectedQuestion(q);
              }}
              className={`app-table-row ${
                selectedQuestion?.id === q.id ? "selected-row" : ""
              }`}
              ref={selectedQuestion?.id === q.id ? selectedRowRef : null}
            >
              <td>{q.id}</td>
              <td>{renderWithMath(q.question)}</td>
              <td>{renderWithMath(q.answer)}</td>
              <td style={{ textAlign: "center" }}>
                <div className="app-table-actions">
                  <button
                    type="button"
                    title="Dettagli"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuestion(q);
                      setShowDetail(true);
                    }}
                    className="app-table-remove"
                  >
                    <File />
                  </button>
                  <button
                    type="button"
                    title="Rimuovi"
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirm = window.confirm("Sei sicuro di voler rimuovere questo quesito?");
                      if (!confirm) return;
                      window.flashcardAPI.remove(q.id).then(() => {
                        setSelectedQuestion(null);
                        window.flashcardAPI.load().then(setQuestions);
                      });
                    }}
                    className="app-table-remove"
                  >
                    <Trash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="app-footer">
        <span className="app-footer-text">{`Totale quesiti: ${questions.length}`}</span>
      </div>
    </div>
  );
}

export default App;
