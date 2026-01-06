import { SettingsPanel, SocketSettings } from './components/SettingsPanel';
import { ChatViewer } from './components/ChatViewer';
import { useTikTokLive, TikTokMessage } from './hooks/useTikTokLive';
import { useSocketConnection } from './hooks/useSocketConnection';
import { Sidebar, Wifi, WifiOff } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [showSettings, setShowSettings] = useState(true);

    // Socket Settings State
    const [socketSettings, setSocketSettings] = useState<SocketSettings>({
        enabled: false,
        url: 'http://localhost:3000',
        apiKey: '',
        roomId: '',
        filterPrefix: ''
    });

    // Socket Connection Hook
    const { isConnected: isSocketConnected, error: socketError, sendToSocket } = useSocketConnection({
        url: socketSettings.url,
        apiKey: socketSettings.apiKey,
        roomId: socketSettings.roomId,
        enabled: socketSettings.enabled
    });

    // Handle new chat messages for forwarding
    const handleNewChat = useCallback((msg: TikTokMessage) => {
        // Only forward if enabled and socket is connected
        if (!socketSettings.enabled || !isSocketConnected) return;

        // Apply Filter Prefix
        if (socketSettings.filterPrefix && !msg.comment.startsWith(socketSettings.filterPrefix)) {
            return;
        }

        // Prepare payload
        const payload = {
            uniqueId: msg.uniqueId,
            nickname: msg.nickname,
            comment: msg.comment,
            timestamp: msg.timestamp,
            profilePictureUrl: msg.profilePictureUrl
        };

        // Emit event
        sendToSocket('tiktok-chat', payload);

    }, [socketSettings.enabled, socketSettings.filterPrefix, isSocketConnected, sendToSocket]);

    // TikTok Live Hook (passing the callback)
    const { isConnected, roomId, messages, gifts, error, connect, disconnect } = useTikTokLive(handleNewChat);

    return (
        <div className="h-screen w-screen bg-transparent text-foreground font-sans flex flex-col overflow-hidden relative selection:bg-tiktok-pink/30">

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-background/40 pointer-events-none" />

            {/* Header - Drag Region */}
            <header className="h-12 flex items-center justify-between px-4 pl-24 shrink-0 z-50 app-drag-region border-b border-white/5 bg-background/20 backdrop-blur-md">
                <div className="flex items-center gap-3 app-no-drag transition-opacity duration-300 hover:opacity-100 opacity-80">
                    <div className={`transition-all duration-300 ${isConnected ? 'opacity-100 scale-100' : 'opacity-50 scale-90 grayscale'}`}>
                        <div className="relative">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-tiktok-cyan shadow-[0_0_8px_#00f2ea]' : 'bg-muted-foreground'}`} />
                            {isConnected && <div className="absolute inset-0 w-2 h-2 rounded-full bg-tiktok-cyan animate-ping opacity-75" />}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-semibold text-xs tracking-wide text-foreground/90">
                            TikTok Viewer
                        </h1>
                        {isConnected && roomId && (
                            <span className="text-[9px] font-medium text-muted-foreground leading-none">
                                #{roomId}
                            </span>
                        )}
                    </div>
                </div>

                {/* Socket Status Indicator */}
                {socketSettings.enabled && (
                    <div className="flex items-center gap-1.5 app-no-drag px-2 py-1 bg-black/20 rounded-full border border-white/5" title={socketError || (isSocketConnected ? "Socket Connected" : "Connecting...")}>
                        {isSocketConnected ? <Wifi size={10} className="text-green-400" /> : <WifiOff size={10} className="text-red-400" />}
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">
                            {isSocketConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 app-no-drag">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-1.5 rounded-md transition-all duration-200 ${showSettings
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'hover:bg-white/5 text-muted-foreground'
                            }`}
                    >
                        <Sidebar size={16} strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-row min-h-0 z-0">
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatViewer messages={messages} gifts={gifts} />
                </div>

                {/* Settings Panel Sidebar */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="h-full border-l border-white/10 bg-background/30 backdrop-blur-xl z-40 flex flex-col overflow-hidden"
                        >
                            <div className="w-[320px] h-full flex flex-col">
                                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                    <SettingsPanel
                                        onConnect={connect}
                                        onDisconnect={disconnect}
                                        isConnected={isConnected}
                                        error={error}
                                        socketSettings={socketSettings}
                                        onSocketSettingsChange={setSocketSettings}
                                    />

                                    <div className="mt-8">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">Session Stats</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-colors">
                                                <span className="text-xl font-bold text-foreground">
                                                    {messages.length}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium">Messages</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:bg-white/10 transition-colors">
                                                <span className="text-xl font-bold text-tiktok-pink">
                                                    {gifts.length}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium">Gifts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="p-3 border-t border-white/5 bg-black/10 text-[10px] text-center text-muted-foreground/40 font-mono">
                                    v1.0.0 • {isSocketConnected ? 'Socket Active' : 'Socket Idle'}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

export default App
