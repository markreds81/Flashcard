import { promises as fs } from 'fs';
import path from 'path';
import { Quesito } from './types';

const filePath = path.join(__dirname, 'quesiti.json');

export async function saveToFile(quesiti: Quesito[]) {
  const json = JSON.stringify(quesiti, null, 2);
  await fs.writeFile(filePath, json, 'utf-8');
}

export async function loadFromFile(): Promise<Quesito[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Quesito[];
  } catch {
    return [];
  }
}
