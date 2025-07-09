import React, { useRef, useState } from "react";
import { Question } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormQuestionProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSubmit: (question: Omit<Question, "id">) => Promise<boolean>;
}

export default function FormQuestion({ open, onOpenChange, onSubmit }: FormQuestionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [qimgData, setQimgData] = useState<Uint8Array | null>(null);
  const [qimgMime, setQimgMime] = useState<string | null>(null);
  const [aimgData, setAimgData] = useState<Uint8Array | null>(null);
  const [aimgMime, setAimgMime] = useState<string | null>(null);
  const qimgRef = useRef<HTMLInputElement | null>(null);
  const aimgRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setData: (data: Uint8Array | null) => void,
    setMime: (mime: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    setData(new Uint8Array(arrayBuffer));
    setMime(file.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit({
      question,
      answer,
      topic,
      subject,
      qimg_data: qimgData,
      qimg_mime: qimgMime,
      aimg_data: aimgData,
      aimg_mime: aimgMime
    });

    if (success) {
      setQuestion("");
      setAnswer("");
      setTopic("");
      setSubject("");
      setQimgData(null);
      setQimgMime(null);
      setAimgData(null);
      setAimgMime(null);
      onOpenChange(false);
      if (qimgRef.current) qimgRef.current.value = "";
      if (aimgRef.current) aimgRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black dark:bg-zinc-900 w-[90vw] h-[90vh] sm:w-[80vw] sm:h-[80vh] max-w-none max-h-none overflow-auto">
        <DialogHeader>
          <DialogTitle>Aggiungi Quesito</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del quesito da aggiungere.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 overflow-auto"
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
              rows={4}
              className="border border-gray-300 rounded px-2 py-1 resize-y"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Risposta</label>
            <textarea
              value={answer}
              placeholder='Supporta HTML e MathJax. Esempio: "La derivata di x^2 è $2x$"'
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="border border-gray-300 rounded px-2 py-1 resize-y"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Immagine domanda (opzionale):
            </label>
            <input
              ref={qimgRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setQimgData, setQimgMime)}
              className="border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">
              Immagine risposta (opzionale)
            </label>
            <input
              ref={aimgRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setAimgData, setAimgMime)}
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
      </DialogContent>
    </Dialog>
  );
}
