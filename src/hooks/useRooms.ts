import { useState, useCallback } from 'react';

interface Room {
    roomId: string;
    createdBy: string;
    createdAt: number;
    // other fields omitted for brevity
}

export const useRooms = (apiUrl: string, apiKey: string) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = useCallback(async () => {
        if (!apiUrl || !apiKey) {
            setError("Missing API URL or Key");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Remove trailing slash if present
            const cleanUrl = apiUrl.replace(/\/$/, "");
            const response = await fetch(`${cleanUrl}/v1/rooms`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized: Check API Key");
                throw new Error(`Failed to fetch rooms: ${response.statusText}`);
            }

            const data = await response.json();

            // Validate data is array
            if (Array.isArray(data)) {
                setRooms(data);
            } else {
                throw new Error("Invalid API response format");
            }

        } catch (err: any) {
            console.error('Failed to fetch rooms:', err);
            setError(err.message);
            setRooms([]); // Clear on error?
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, apiKey]);

    return {
        rooms,
        isLoading,
        error,
        fetchRooms
    };
};
