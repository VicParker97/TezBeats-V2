// Analytics Types for TezBeat Music Player

import type { Playlist, QueueHistoryItem } from "./playlist";
import type { MusicNFT, RepeatMode } from "./musicNFT";

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

export interface QueueData {
    tracks: MusicNFT[];
    currentIndex: number;
    repeatMode: RepeatMode;
    shuffleMode: boolean;
    originalQueue: MusicNFT[] | null;
    savedAt: number; // timestamp
}

export interface AnalyticsData {
    playHistory: PlayHistoryEntry[]; // Last 50 entries
    trackAnalytics: Record<string, TrackAnalytics>; // Keyed by track ID
    favorites: string[]; // Array of track IDs
    playlists: Playlist[]; // Custom user playlists (v2+)
    queue?: QueueData; // Queue state (v3+)
    queueHistory?: QueueHistoryItem[]; // Queue history (v3+)
    version: number; // Schema version for migrations
}
