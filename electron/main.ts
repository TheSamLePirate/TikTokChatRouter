import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { WebcastPushConnection } from 'tiktok-live-connector';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tiktokConnection: WebcastPushConnection | null = null;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hiddenInset',
        vibrancy: 'under-window', // macOS glass effect
        visualEffectState: 'active',
        backgroundColor: '#00000000', // Transparent for vibrancy
    });

    // Load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// TikTok IPC Handlers
ipcMain.handle('tiktok-connect', async (_event, username: string) => {
    if (tiktokConnection) {
        tiktokConnection.disconnect();
    }

    try {
        tiktokConnection = new WebcastPushConnection(username);

        // Forward events to renderer
        tiktokConnection.on('chat', (data) => {
            console.log(data);
            mainWindow?.webContents.send('tiktok-chat', data);
        });

        tiktokConnection.on('gift', (data) => {
            mainWindow?.webContents.send('tiktok-gift', data);
        });

        tiktokConnection.on('connected', (state) => {
            console.log('Connected to roomId', state.roomId);
        });

        const state = await tiktokConnection.connect();
        return { success: true, roomId: state.roomId };
    } catch (err: any) {
        console.error('Failed to connect', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('tiktok-disconnect', () => {
    if (tiktokConnection) {
        tiktokConnection.disconnect();
        tiktokConnection = null;
    }
    return true;
});
