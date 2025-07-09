export interface Question {
  id: number;
  question: string;
  answer: string;
  topic: string;
  subject: string;
  qimg_data?: Uint8Array | null;
  qimg_mime?: string | null;
  aimg_data?: Uint8Array | null;
  aimg_mime?: string | null;
}

interface QuestionAPI {
  load: () => Promise<Question[]>;
  add: (q: Omit<Question, 'id'>) => Promise<Question>;
  remove: (id: number) => Promise<void>;
}

declare global {
  interface Window {
    flashcardAPI: QuestionAPI;
  }
}