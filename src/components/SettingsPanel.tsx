import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sliders, Link, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRooms } from '../hooks/useRooms';

export interface SocketSettings {
    enabled: boolean;
    url: string;
    apiKey: string;
    roomId: string; // The selected room ID
    filterPrefix: string;
}

interface SettingsPanelProps {
    onConnect: (username: string) => void;
    onDisconnect: () => void;
    isConnected: boolean;
    error: string | null;
    socketSettings: SocketSettings;
    onSocketSettingsChange: (settings: SocketSettings) => void;
}

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function SettingsPanel({
    onConnect,
    onDisconnect,
    isConnected,
    error,
    socketSettings,
    onSocketSettingsChange
}: SettingsPanelProps) {
    const [username, setUsername] = useState('officialgeilegisela');

    // We use the useRooms hook here
    const { rooms, isLoading: isLoadingRooms, error: roomError, fetchRooms } = useRooms(socketSettings.url, socketSettings.apiKey);

    const updateSettings = (updates: Partial<SocketSettings>) => {
        onSocketSettingsChange({ ...socketSettings, ...updates });
    };

    return (
        <div className="w-full space-y-6">

            {/* Connection Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Link size={14} className="text-secondary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">TikTok Connection</h3>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground ml-1">TikTok Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isConnected}
                            className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-tiktok-cyan/50 focus:border-tiktok-cyan/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="@username"
                        />
                    </div>

                    {isConnected ? (
                        <button
                            onClick={onDisconnect}
                            className="w-full bg-destructive/80 hover:bg-destructive text-white px-3 py-2 rounded-md transition-colors text-xs font-semibold shadow-sm backdrop-blur-sm"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={() => onConnect(username)}
                            className="w-full bg-gradient-to-br from-tiktok-pink to-pink-600 hover:from-pink-500 hover:to-pink-600 text-white px-3 py-2 rounded-md transition-all text-xs font-semibold shadow-lg shadow-tiktok-pink/20"
                        >
                            Connect Live
                        </button>
                    )}
                    {error && <p className="text-red-400 text-[10px] px-1">{error}</p>}
                </div>
            </div>

            {/* Socket Forwarding Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Send size={14} className="text-tiktok-cyan" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Socket Forwarding</h3>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5 space-y-4">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-foreground/90">Enable Forwarding</label>
                        <input
                            type="checkbox"
                            checked={socketSettings.enabled}
                            onChange={(e) => updateSettings({ enabled: e.target.checked })}
                            className="accent-tiktok-cyan h-3.5 w-3.5"
                        />
                    </div>

                    {socketSettings.enabled && (
                        <div className="space-y-3 pt-2">
                            {/* Socket URL */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-muted-foreground ml-1">Server URL</label>
                                <input
                                    type="text"
                                    value={socketSettings.url}
                                    onChange={(e) => updateSettings({ url: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-md px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-tiktok-cyan/50 outline-none"
                                    placeholder="http://localhost:3000"
                                />
                            </div>

                            {/* API Key */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-muted-foreground ml-1">API Key</label>
                                <input
                                    type="password"
                                    value={socketSettings.apiKey}
                                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-md px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-tiktok-cyan/50 outline-none"
                                    placeholder="Secret Key"
                                />
                            </div>

                            {/* Room Selection */}
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-medium text-muted-foreground ml-1 flex justify-between">
                                    <span>Target Room</span>
                                    <button
                                        onClick={fetchRooms}
                                        disabled={isLoadingRooms || !socketSettings.apiKey}
                                        className="text-tiktok-cyan hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {isLoadingRooms ? <RefreshCw size={10} className="animate-spin" /> : 'Fetch Rooms'}
                                    </button>
                                </label>
                                <select
                                    value={socketSettings.roomId}
                                    onChange={(e) => updateSettings({ roomId: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-md px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-tiktok-cyan/50 outline-none appearance-none"
                                >
                                    <option value="">-- Select Room --</option>
                                    {rooms.map(room => (
                                        <option key={room.roomId} value={room.roomId}>
                                            {room.roomId}
                                        </option>
                                    ))}
                                </select>
                                {roomError && <p className="text-red-400 text-[9px] mt-1">{roomError}</p>}
                                {rooms.length > 0 && !roomError && <p className="text-green-400 text-[9px] mt-1 flex items-center gap-1"><CheckCircle2 size={9} /> {rooms.length} rooms found</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sliders size={14} className="text-orange-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filters</h3>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground ml-1">Forward Prefix</label>
                        <input
                            type="text"
                            value={socketSettings.filterPrefix}
                            onChange={(e) => updateSettings({ filterPrefix: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-orange-400/50 focus:border-orange-400/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="e.g. ! (Leave empty to forward all)"
                        />
                        <p className="text-[9px] text-muted-foreground/60 px-1">
                            Only messages starting with this prefix will be sent to the socket.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
