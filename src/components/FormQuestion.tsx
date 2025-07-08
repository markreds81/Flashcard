import React, { useRef, useState } from 'react';
import { Question } from '../types';

interface FormQuestionProps {
  onSubmit: (question: Omit<Question, 'id'>) => Promise<boolean>;
}

export default function FormQuestion({ onSubmit }: FormQuestionProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [qimg, setQimg] = useState<Uint8Array | null>(null);
  const [aimg, setAimg] = useState<Uint8Array | null>(null);
  const qimgRef = useRef<HTMLInputElement | null>(null);
  const aimgRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (data: Uint8Array | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    setter(new Uint8Array(arrayBuffer));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      question,
      answer,
      topic,
      subject,
      qimg,
      aimg,
    });

    if (success) {
      setQuestion('');
      setAnswer('');
      setTopic('');
      setSubject('');
      setQimg(null);
      setAimg(null);
      if (qimgRef.current) qimgRef.current.value = '';
      if (aimgRef.current) aimgRef.current.value = '';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto p-4"
    >
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Materia</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Seleziona materia</option>
          <option value="Analisi Matematica">Analisi Matematica</option>
          <option value="Altro">Altro</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Argomento</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Domanda</label>
        <textarea
          value={question}
          placeholder='Supporta HTML e MathJax. Esempio: "La derivata di x^2 è $2x$"'
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="border border-gray-300 rounded px-2 py-1 resize-y"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Risposta</label>
        <textarea
          value={answer}
          placeholder='Supporta HTML e MathJax. Esempio: "La derivata di x^2 è $2x$"'
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          className="border border-gray-300 rounded px-2 py-1 resize-y"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Immagine domanda (opzionale):</label>
        <input
          ref={qimgRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setQimg)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Immagine risposta (opzionale)</label>
        <input
          ref={aimgRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setAimg)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="col-span-1 md:col-span-2 text-right mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!subject || !topic || !question || !answer}
        >
          Aggiungi
        </button>
      </div>
    </form>
  );
}