import { SettingsPanel } from './components/SettingsPanel';
import { ChatViewer } from './components/ChatViewer';
import { useTikTokLive } from './hooks/useTikTokLive';
import { Settings2, Circle, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const { isConnected, roomId, messages, gifts, error, connect, disconnect } = useTikTokLive();
    const [showSettings, setShowSettings] = useState(true);

    return (
        <div className="h-screen w-screen bg-background text-foreground font-sans flex flex-col overflow-hidden relative selection:bg-tiktok-pink/30">

            {/* Background decorations - Subtle ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-tiktok-pink/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-64 bg-tiktok-cyan/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header - Drag Region */}
            <header className="h-12 flex items-center justify-between px-4 shrink-0 z-50 app-drag-region bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-3 app-no-drag">
                    <div className={`mt-1 transition-all duration-300 ${isConnected ? 'opacity-100 scale-100' : 'opacity-50 scale-90 grayscale'}`}>
                        <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-tiktok-cyan shadow-[0_0_8px_#00f2ea]' : 'bg-muted-foreground'}`} />
                            {isConnected && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-tiktok-cyan animate-ping opacity-75" />}
                        </div>
                    </div>
                    <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        TikTok<span className="font-extrabold text-tiktok-pink">Viewer</span>
                    </h1>
                    {isConnected && roomId && (
                        <span className="text-[10px] font-mono text-muted-foreground/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                            #{roomId}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 app-no-drag">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${showSettings
                                ? 'bg-secondary/10 text-tiktok-cyan shadow-[0_0_10px_rgba(0,242,234,0.1)] border border-tiktok-cyan/20'
                                : 'hover:bg-white/5 text-muted-foreground border border-transparent'
                            }`}
                    >
                        <Settings2 size={16} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-h-0 z-0">
                <ChatViewer messages={messages} gifts={gifts} />
            </main>

            {/* Settings Panel Overlay */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-y-0 right-0 w-[380px] bg-background/95 backdrop-blur-2xl z-40 shadow-[-10px_0_40px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col"
                    >
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <SettingsPanel
                                onConnect={connect}
                                onDisconnect={disconnect}
                                isConnected={isConnected}
                                error={error}
                            />

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <span className="text-3xl font-bold bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/60 bg-clip-text text-transparent">
                                        {messages.length}
                                    </span>
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Messages</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <span className="text-3xl font-bold bg-gradient-to-r from-tiktok-pink to-tiktok-pink/60 bg-clip-text text-transparent">
                                        {gifts.length}
                                    </span>
                                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Gifts</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 border-t border-white/5 text-[10px] text-center text-muted-foreground/40 font-mono">
                            TIKTOK LIVE VIEWER v1.0.0
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default App
