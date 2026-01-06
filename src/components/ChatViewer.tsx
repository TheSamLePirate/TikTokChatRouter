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
        <div className="flex-1 w-full h-full relative overflow-hidden bg-transparent flex flex-col font-sans">
            {/* Top gradient mask for smooth fade-in */}
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar pb-20">
                <AnimatePresence initial={false} mode="popLayout">
                    {allEvents.map((event) => (
                        <motion.div
                            key={`${event.id}-${event.timestamp}`}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                            className={`relative flex gap-3 group max-w-[90%] ${event.type === 'gift' ? 'self-center mx-auto' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`shrink-0 relative ${event.type === 'gift' ? 'order-2' : 'order-1'}`}>
                                <div className={`relative rounded-full p-[2px] ${event.type === 'gift'
                                    ? 'bg-gradient-to-tr from-tiktok-cyan to-tiktok-pink animate-spin-slow'
                                    : 'bg-gradient-to-tr from-white/10 to-transparent'}`}>
                                    {event.profilePictureUrl ? (
                                        <img
                                            src={event.profilePictureUrl}
                                            alt={event.nickname}
                                            className="w-9 h-9 rounded-full object-cover border border-white/5 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold border border-white/5 text-muted-foreground">
                                            {event.nickname?.charAt(0) || event.uniqueId?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex flex-col min-w-0 ${event.type === 'gift' ? 'order-1 items-end' : 'order-2 items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1 pl-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <span className={`text-[11px] font-bold tracking-tight ${event.type === 'gift'
                                        ? 'bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent'
                                        : 'text-foreground/60'}`}>
                                        {event.nickname.length < 2 ? event.uniqueId : event.nickname}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground/50">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className={`relative px-4 py-2 rounded-2xl backdrop-blur-md border shadow-sm transition-all duration-300
                                    ${event.type === 'gift'
                                        ? 'bg-gradient-to-r from-purple-900/60 to-tiktok-pink/20 border-tiktok-pink/30 text-white rounded-tr-sm'
                                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-foreground/90 rounded-tl-sm'}`}
                                >
                                    {event.type === 'gift' && (
                                        <div className="flex items-center gap-2 mb-0.5 text-tiktok-pink font-bold text-[10px] uppercase tracking-widest">
                                            <Gift size={12} className="animate-bounce" /> Gift Received
                                        </div>
                                    )}
                                    <p className={`text-sm leading-relaxed break-words font-medium ${event.type === 'gift' ? 'text-lg text-white drop-shadow-md' : ''}`}>
                                        {event.comment} <span className="text-tiktok-cyan font-bold ml-1">{event.type === 'gift' && `x${event.diamondCount}`}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Bottom gradient mask */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        </div>
    );
}
