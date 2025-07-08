export interface Quesito {
  id: number;
  domanda: string;
  risposta: string;
  argomento: string;
  materia: string;
}

interface QuesitiAPI {
  load: () => Promise<Quesito[]>;
  add: (q: Omit<Quesito, 'id'>) => Promise<Quesito>;
  remove: (id: number) => Promise<void>;
}

declare global {
  interface Window {
    quesitiAPI: QuesitiAPI;
  }
}