/**
 * Playlist type definition for custom user playlists
 */
export interface Playlist {
    id: string;                    // UUID
    name: string;
    description?: string;
    trackIds: string[];            // Array of MusicNFT.id
    createdAt: number;             // Unix timestamp (ms)
    updatedAt: number;             // Unix timestamp (ms)
}

/**
 * Queue history item for tracking past queue states
 */
export interface QueueHistoryItem {
    id: string;                    // UUID
    name: string;                  // Auto-generated or user-named
    tracks: string[];              // Array of MusicNFT.id
    playedAt: number;              // Unix timestamp (ms)
    source?: string;               // "playlist:<id>" | "library" | "manual"
}
