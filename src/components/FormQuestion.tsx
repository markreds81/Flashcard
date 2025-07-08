import React, { useState } from 'react';
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto p-4"
    >
      {/* RIGA 1 */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* RIGA 2 */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Answer</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* RIGA 3 */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Question Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setQimg)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Answer Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setAimg)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* PULSANTE */}
      <div className="col-span-1 md:col-span-2 text-center mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Question
        </button>
      </div>
    </form>
  );
}