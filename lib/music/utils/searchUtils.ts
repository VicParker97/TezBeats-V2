import type { MusicNFT } from "../types/musicNFT";
import type { PlayHistoryEntry } from "../types/analytics";

export type SortBy = "name" | "artist" | "recent" | "playCount" | "dateAdded";
export type SortOrder = "asc" | "desc";

export interface ActiveFilters {
    favorites: boolean;
    recentlyPlayed: boolean;
    collection?: string;
    artist?: string;
    genre?: string;
}

export function searchTracks(tracks: MusicNFT[], query: string): MusicNFT[] {
    if (!query.trim()) return tracks;

    const lowerQuery = query.toLowerCase();
    return tracks.filter(
        (track) =>
            track.name.toLowerCase().includes(lowerQuery) ||
            track.audioMetadata.artist?.toLowerCase().includes(lowerQuery) ||
            track.collection.toLowerCase().includes(lowerQuery) ||
            track.audioMetadata.genre?.toLowerCase().includes(lowerQuery) ||
            track.creator.toLowerCase().includes(lowerQuery)
    );
}

export function filterTracks(
    tracks: MusicNFT[],
    filters: ActiveFilters,
    favorites: string[],
    playHistory: PlayHistoryEntry[]
): MusicNFT[] {
    let filtered = [...tracks];

    if (filters.favorites) {
        filtered = filtered.filter((t) => favorites.includes(t.id));
    }

    if (filters.recentlyPlayed) {
        const recentIds = new Set(playHistory.map((h) => h.trackId));
        filtered = filtered.filter((t) => recentIds.has(t.id));
    }

    if (filters.collection) {
        filtered = filtered.filter((t) => t.collection === filters.collection);
    }

    if (filters.artist) {
        filtered = filtered.filter(
            (t) => (t.audioMetadata.artist || t.creator) === filters.artist
        );
    }

    if (filters.genre) {
        filtered = filtered.filter((t) => t.audioMetadata.genre === filters.genre);
    }

    return filtered;
}

export function sortTracks(
    tracks: MusicNFT[],
    sortBy: SortBy,
    sortOrder: SortOrder,
    trackAnalytics: Record<string, { playCount: number; lastPlayed: number }>
): MusicNFT[] {
    const sorted = [...tracks];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "artist":
                comparison = (a.audioMetadata.artist || a.creator).localeCompare(
                    b.audioMetadata.artist || b.creator
                );
                break;
            case "recent":
                comparison =
                    (trackAnalytics[b.id]?.lastPlayed || 0) -
                    (trackAnalytics[a.id]?.lastPlayed || 0);
                break;
            case "playCount":
                comparison =
                    (trackAnalytics[b.id]?.playCount || 0) -
                    (trackAnalytics[a.id]?.playCount || 0);
                break;
            case "dateAdded":
                // Since we don't have dateAdded, use tokenId as proxy (lower = earlier)
                comparison = a.tokenId.localeCompare(b.tokenId);
                break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
}

// Helper to get unique values from tracks for filter options
export function getUniqueCollections(tracks: MusicNFT[]): string[] {
    return Array.from(new Set(tracks.map((t) => t.collection))).sort();
}

export function getUniqueArtists(tracks: MusicNFT[]): string[] {
    return Array.from(
        new Set(tracks.map((t) => t.audioMetadata.artist || t.creator))
    ).sort();
}

export function getUniqueGenres(tracks: MusicNFT[]): string[] {
    return Array.from(
        new Set(tracks.map((t) => t.audioMetadata.genre).filter(Boolean) as string[])
    ).sort();
}
