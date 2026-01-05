import { useEffect, useRef } from 'react';
import { TikTokMessage, TikTokGift } from '../hooks/useTikTokLive';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

interface ChatViewerProps {
    messages: TikTokMessage[];
    gifts: TikTokGift[];
}

export function ChatViewer({ messages, gifts }: ChatViewerProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    const allEvents = [...messages.map(m => ({ ...m, type: 'chat' })), ...gifts.map(g => ({ ...g, type: 'gift', comment: `Sent ${g.giftName}` }))]
        .sort((a, b) => a.timestamp - b.timestamp);

    useEffect(() => {
        // Only scroll if we are near the bottom or on new messages
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, gifts]);

    return (
        <div className="flex-1 w-full relative overflow-hidden bg-transparent flex flex-col font-sans">
            {/* Top gradient mask for smooth fade-in */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-20">
                <AnimatePresence initial={false} mode="popLayout">
                    {allEvents.map((event) => (
                        <motion.div
                            key={`${event.id}-${event.timestamp}`}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                            className={`relative flex gap-3 group max-w-[95%] ${event.type === 'gift' ? 'self-center mx-auto' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`shrink-0 relative ${event.type === 'gift' ? 'order-2' : 'order-1'}`}>
                                <div className={`relative rounded-full p-[2px] ${event.type === 'gift'
                                    ? 'bg-gradient-to-tr from-tiktok-cyan to-tiktok-pink animate-spin-slow'
                                    : 'bg-gradient-to-tr from-white/20 to-white/5'}`}>
                                    {event.profilePictureUrl ? (
                                        <img
                                            src={event.profilePictureUrl}
                                            alt={event.nickname}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-background/90"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background/90">
                                            {event.nickname?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    {/* Online/Active indicator dot */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col min-w-0 ${event.type === 'gift' ? 'order-1 items-end' : 'order-2 items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 opacity-80 pl-1">
                                    <span className={`text-xs font-bold ${event.type === 'gift'
                                        ? 'bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent'
                                        : 'text-foreground/70'}`}>
                                        {event.nickname}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className={`relative px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-sm transition-all duration-300
                                    ${event.type === 'gift'
                                        ? 'bg-gradient-to-r from-purple-900/60 to-tiktok-pink/30 border-tiktok-pink/40 text-white rounded-tr-none'
                                        : 'bg-card/60 hover:bg-card/80 border-white/5 text-foreground/90 rounded-tl-none'}`}
                                >
                                    {event.type === 'gift' && (
                                        <div className="flex items-center gap-2 mb-1 text-tiktok-pink font-bold text-xs uppercase tracking-widest">
                                            <Gift size={14} className="animate-bounce" /> Gift
                                        </div>
                                    )}
                                    <p className={`text-sm leading-relaxed break-words font-medium ${event.type === 'gift' ? 'text-lg text-white drop-shadow-md' : ''}`}>
                                        {event.comment} <span className="text-secondary/80 font-bold">{event.type === 'gift' && `(x${event.diamondCount})`}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Bottom gradient mask */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background via-background/90 to-transparent z-10 pointer-events-none" />
        </div>
    );
}
