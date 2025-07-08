export interface Question {
  id: number;
  question: string;
  answer: string;
  topic: string;
  subject: string;
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