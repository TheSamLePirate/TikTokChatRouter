import { useState, useEffect, useCallback, useRef } from 'react';

export type TikTokMessage = {
    id: string;
    uniqueId: string;
    userId: string;
    comment: string;
    timestamp: number;
    nickname: string;
    profilePictureUrl: string;
};

export type TikTokGift = {
    id: string;
    uniqueId: string;
    userId: string;
    giftId: number;
    giftName: string;
    diamondCount: number;
    nickname: string;
    profilePictureUrl: string;
    timestamp: number;
};

export const useTikTokLive = (onNewChat?: (msg: TikTokMessage) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<TikTokMessage[]>([]);
    const [gifts, setGifts] = useState<TikTokGift[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Use ref to keep callback current without re-binding listeners
    const onNewChatRef = useRef(onNewChat);
    useEffect(() => {
        onNewChatRef.current = onNewChat;
    }, [onNewChat]);

    const connect = useCallback(async (username: string) => {
        setError(null);
        try {
            const result = await window.tiktok.connect(username);
            if (result.success) {
                setIsConnected(true);
                setRoomId(result.roomId || null);
            } else {
                setError(result.error || 'Failed to connect');
                setIsConnected(false);
            }
        } catch (err: any) {
            setError(err.message);
            setIsConnected(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        await window.tiktok.disconnect();
        setIsConnected(false);
        setRoomId(null);
    }, []);

    useEffect(() => {
        const cleanupChat = window.tiktok.onChat((data) => {
            const newMessage: TikTokMessage = {
                id: data.msgId,
                uniqueId: data.uniqueId,
                userId: data.userId,
                comment: data.comment,
                nickname: data.nickname,
                profilePictureUrl: data.profilePictureUrl,
                timestamp: Date.now(),
            };

            setMessages((prev) => {
                // Keep last 100 messages
                return [...prev.slice(-99), newMessage];
            });

            // Trigger callback if processing new message
            if (onNewChatRef.current) {
                onNewChatRef.current(newMessage);
            }
        });

        const cleanupGift = window.tiktok.onGift((data) => {
            console.log('Gift received', data);
            setGifts((prev) => {
                const newGift: TikTokGift = {
                    id: data.msgId,
                    uniqueId: data.uniqueId,
                    userId: data.userId,
                    giftId: data.giftId,
                    giftName: data.giftName,
                    diamondCount: data.diamondCount,
                    nickname: data.nickname,
                    profilePictureUrl: data.profilePictureUrl,
                    timestamp: Date.now(),
                };
                return [...prev.slice(-19), newGift];
            });
        });

        return () => {
            cleanupChat();
            cleanupGift();
        };
    }, []);

    return {
        isConnected,
        roomId,
        messages,
        gifts,
        error,
        connect,
        disconnect,
    };
};
