import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketConnectionProps {
    url: string;
    apiKey: string;
    roomId: string; // The room to join/emit to
    enabled: boolean;
}

interface SocketStatus {
    isConnected: boolean;
    error: string | null;
}

export const useSocketConnection = ({ url, apiKey, roomId, enabled }: UseSocketConnectionProps) => {
    const [status, setStatus] = useState<SocketStatus>({ isConnected: false, error: null });
    const socketRef = useRef<Socket | null>(null);

    // Effect to manage connection lifecycle
    useEffect(() => {
        // Disconnect if disabled or missing required credentials
        if (!enabled || !url || !apiKey) {
            if (socketRef.current) {
                console.log('🔌 Socket disabled or missing config, disconnecting...');
                socketRef.current.disconnect();
                socketRef.current = null;
                setStatus({ isConnected: false, error: null });
            }
            return;
        }

        // Avoid reconnecting if params haven't changed meaningfully (handled by react dep array)
        // Check if we already have a socket connection to the same URL
        if (socketRef.current?.connected && (socketRef.current.io as any).uri === url) {
            // If just roomId changed, we handle that separately? 
            // Ideally we re-handshake if auth changes, but user ID is static for now.
        }

        console.log('🔌 Connecting to Socket.io:', url);

        try {
            // Initialize Socket
            // We use a static/random userId for this viewer instance
            const userId = `tiktok-viewer-${Math.random().toString(36).substr(2, 9)}`;

            const newSocket = io(url, {
                auth: { apiKey, userId },
                reconnectionAttempts: 5,
                timeout: 10000,
            });

            socketRef.current = newSocket;

            // Event Handlers
            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
                setStatus({ isConnected: true, error: null });

                // Join room immediately upon connection if roomId exists
                if (roomId) {
                    console.log('➡️ Joining room:', roomId);
                    newSocket.emit('room:join', { roomId }, (response: any) => {
                        if (response?.error) {
                            console.error('❌ Failed to join room:', response.error);
                            setStatus(prev => ({ ...prev, error: `Joined failed: ${response.error}` }));
                        } else {
                            console.log('✅ Joined room:', roomId, response);
                        }
                    });
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket connection error:', err.message);
                setStatus({ isConnected: false, error: err.message });
            });

            newSocket.on('disconnect', (reason) => {
                console.log('⚠️ Socket disconnected:', reason);
                setStatus({ isConnected: false, error: null });
            });

            // Cleanup
            return () => {
                console.log('🔌 Cleaning up socket...');
                newSocket.disconnect();
                socketRef.current = null;
            };

        } catch (err: any) {
            setStatus({ isConnected: false, error: err.message });
        }

    }, [url, apiKey, enabled]); // removed roomId from dependency to prevent full reconnect


    // Separate effect to handle Room switching without full reconnect
    useEffect(() => {
        if (!socketRef.current?.connected || !roomId) return;

        console.log('➡️ Switching/Joining room:', roomId);
        // We might want to leave the previous room? The API doesn't strictly require it if we just want to emit?
        // But for 'join' semantics (presence), better to be explicit. 
        // For now, simply emitting 'room:join' is updating presence.

        socketRef.current.emit('room:join', { roomId }, (response: any) => {
            if (response?.error) {
                console.error('❌ Failed to switch room:', response.error);
            } else {
                console.log('✅ Switched to room:', roomId);
            }
        });

    }, [roomId, status.isConnected]);


    // Function to emit events
    const sendToSocket = useCallback((eventName: string, payload: any) => {
        if (!socketRef.current?.connected || !roomId) {
            console.warn('⚠️ Cannot send: Socket not connected or no Room ID');
            return;
        }

        // Protocol: client emits 'room:emit'
        const eventData = {
            roomId,
            event: eventName,
            payload
        };

        console.log('📤 Sending to socket:', eventData);

        socketRef.current.emit('room:emit', eventData, (ack: any) => {
            if (ack?.error || (ack && !ack.ok)) {
                console.error('❌ Message emit failed:', ack);
            }
        });
    }, [roomId, status.isConnected]);

    return {
        ...status,
        sendToSocket
    };
};
