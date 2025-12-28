// Analytics Types for TezBeat Music Player

export interface PlayHistoryEntry {
    trackId: string;
    timestamp: number; // Unix timestamp in milliseconds
    duration: number; // Seconds played
}

export interface TrackAnalytics {
    playCount: number;
    lastPlayed: number; // Unix timestamp in milliseconds
    totalListenTime: number; // Total seconds listened
    firstPlayed: number; // Unix timestamp in milliseconds
}

export interface AnalyticsData {
    playHistory: PlayHistoryEntry[]; // Last 50 entries
    trackAnalytics: Record<string, TrackAnalytics>; // Keyed by track ID
    favorites: string[]; // Array of track IDs
    version: number; // Schema version for migrations
}
