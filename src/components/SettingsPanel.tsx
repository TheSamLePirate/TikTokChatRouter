import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SettingsPanelProps {
    onConnect: (username: string) => void;
    onDisconnect: () => void;
    isConnected: boolean;
    error: string | null;
}

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function SettingsPanel({ onConnect, onDisconnect, isConnected, error }: SettingsPanelProps) {
    const [username, setUsername] = useState('officialgeilegisela'); // default from request
    const [useApi, setUseApi] = useState(false);
    const [useSocket, setUseSocket] = useState(false);
    const [apiUrl, setApiUrl] = useState('');
    const [socketUrl, setSocketUrl] = useState('');
    const [filterPrefix, setFilterPrefix] = useState('');

    return (
        <div className="w-full max-w-md p-6 bg-card rounded-xl border border-border shadow-2xl backdrop-blur-xl bg-opacity-80">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                Configuration
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">TikTok Username</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isConnected}
                            className="flex-1 bg-input/50 border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-tiktok-cyan outline-none transition-all"
                            placeholder="@username"
                        />
                        {isConnected ? (
                            <button
                                onClick={onDisconnect}
                                className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-md transition-colors font-medium"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={() => onConnect(username)}
                                className="bg-tiktok-pink hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-all font-medium shadow-[0_0_15px_rgba(255,0,80,0.5)] hover:shadow-[0_0_25px_rgba(255,0,80,0.7)]"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Forward to API</label>
                        <input type="checkbox" checked={useApi} onChange={(e) => setUseApi(e.target.checked)} className="accent-tiktok-cyan" />
                    </div>
                    {useApi && (
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-tiktok-cyan outline-none"
                            placeholder="http://localhost:3000/api/webhook"
                        />
                    )}
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Forward to Socket.io</label>
                        <input type="checkbox" checked={useSocket} onChange={(e) => setUseSocket(e.target.checked)} className="accent-tiktok-cyan" />
                    </div>
                    {useSocket && (
                        <input
                            type="text"
                            value={socketUrl}
                            onChange={(e) => setSocketUrl(e.target.value)}
                            className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-tiktok-cyan outline-none"
                            placeholder="ws://localhost:3000"
                        />
                    )}
                </div>

                <div className="space-y-2 border-t border-border/50 pt-4">
                    <label className="block text-sm font-medium">Message Filter (Prefix)</label>
                    <input
                        type="text"
                        value={filterPrefix}
                        onChange={(e) => setFilterPrefix(e.target.value)}
                        className="w-full bg-input/50 border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-tiktok-cyan outline-none"
                        placeholder="e.g. !cmd (Leave empty for all)"
                    />
                </div>

            </div>
        </div>
    );
}
