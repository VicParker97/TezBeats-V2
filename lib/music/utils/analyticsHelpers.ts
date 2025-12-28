import type { MusicNFT } from "../types/musicNFT";

/**
 * Format play count to readable string (e.g., 1.2k, 3.5k)
 * @param count - Play count number
 * @returns Formatted string
 */
export function formatPlayCount(count: number): string {
    if (count < 1000) {
        return count.toString();
    }

    if (count < 1000000) {
        const k = count / 1000;
        return `${k.toFixed(1)}k`;
    }

    const m = count / 1000000;
    return `${m.toFixed(1)}M`;
}

/**
 * Format timestamp to relative time string (e.g., "2 hours ago", "Yesterday")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatLastPlayed(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    if (diffDays === 1) {
        return "Yesterday";
    }

    if (diffDays < 7) {
        return `${diffDays} days ago`;
    }

    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }

    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
}

/**
 * Get a random track from the collection, optionally excluding specific track IDs
 * @param tracks - Array of music NFTs
 * @param excludeIds - Optional array of track IDs to exclude
 * @returns Random track or null if no tracks available
 */
export function getRandomTrack(
    tracks: MusicNFT[],
    excludeIds?: string[]
): MusicNFT | null {
    if (!tracks || tracks.length === 0) {
        return null;
    }

    // Filter out excluded tracks
    const availableTracks = excludeIds && excludeIds.length > 0
        ? tracks.filter((track) => !excludeIds.includes(track.id))
        : tracks;

    if (availableTracks.length === 0) {
        // All tracks are excluded, just pick any random track
        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }

    // Pick random track from available tracks
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    return availableTracks[randomIndex];
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Truncate wallet address for display (e.g., "tz1abc...xyz")
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default 6)
 * @param endChars - Number of characters to show at end (default 4)
 * @returns Truncated address
 */
export function truncateAddress(
    address: string,
    startChars: number = 6,
    endChars: number = 4
): string {
    if (!address || address.length <= startChars + endChars) {
        return address;
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
