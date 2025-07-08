import { ipcRenderer, contextBridge } from 'electron'
import type { Question } from '../src/types'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('questionAPI', {
  load: (): Promise<Question[]> => ipcRenderer.invoke('load-questions'),
  add: (q: Omit<Question, 'id'>): Promise<Question> => ipcRenderer.invoke('add-question', q),
  remove: (id: number): Promise<void> => ipcRenderer.invoke('remove-question', id),
})
