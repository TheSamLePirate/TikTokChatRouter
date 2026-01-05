export interface TikTokAPI {
    connect: (username: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
    disconnect: () => Promise<boolean>;
    onChat: (callback: (data: any) => void) => () => void;
    onGift: (callback: (data: any) => void) => () => void;
}

declare global {
    interface Window {
        tiktok: TikTokAPI;
    }
}
