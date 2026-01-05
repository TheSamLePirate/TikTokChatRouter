import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('tiktok', {
    connect: (username: string) => ipcRenderer.invoke('tiktok-connect', username),
    disconnect: () => ipcRenderer.invoke('tiktok-disconnect'),
    onChat: (callback: (data: any) => void) => {
        const subscription = (_event: any, data: any) => callback(data);
        ipcRenderer.on('tiktok-chat', subscription);
        return () => ipcRenderer.removeListener('tiktok-chat', subscription);
    },
    onGift: (callback: (data: any) => void) => {
        const subscription = (_event: any, data: any) => callback(data);
        ipcRenderer.on('tiktok-gift', subscription);
        return () => ipcRenderer.removeListener('tiktok-gift', subscription);
    }
});
