import { ipcRenderer, contextBridge } from 'electron'
import type { Quesito } from '../src/types'

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

contextBridge.exposeInMainWorld('quesitiAPI', {
  load: (): Promise<Quesito[]> => ipcRenderer.invoke('load-quesiti'),
  add: (q: Omit<Quesito, 'id'>): Promise<Quesito> => ipcRenderer.invoke('add-quesito', q),
  remove: (id: number): Promise<void> => ipcRenderer.invoke('remove-quesito', id),
})
