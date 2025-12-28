import type { AnalyticsData, QueueData } from "../types/analytics";
import type { QueueHistoryItem } from "../types/playlist";

const STORAGE_KEY_PREFIX = "tezbeat_analytics_";
const CURRENT_VERSION = 3;

/**
 * Load analytics data from localStorage for a specific wallet address
 * @param address - Wallet address
 * @returns Analytics data or null if not found/invalid
 */
export function loadAnalyticsData(address: string): AnalyticsData | null {
    if (!address) return null;

    try {
        const key = `${STORAGE_KEY_PREFIX}${address}`;
        const data = localStorage.getItem(key);

        if (!data) return null;

        const parsed = JSON.parse(data) as AnalyticsData;

        // Validate schema version
        if (typeof parsed.version !== "number") {
            console.warn("Invalid analytics data: missing version");
            return null;
        }

        // Handle version migrations if needed
        if (parsed.version < CURRENT_VERSION) {
            // Migrate from v1 to v2: Add playlists array
            if (parsed.version === 1) {
                parsed.playlists = [];
                parsed.version = 2;
            }
            // Migrate from v2 to v3: Add queue and queueHistory
            if (parsed.version === 2) {
                parsed.queue = {
                    tracks: [],
                    currentIndex: -1,
                    repeatMode: 'off',
                    shuffleMode: false,
                    originalQueue: null,
                    savedAt: Date.now()
                };
                parsed.queueHistory = [];
                parsed.version = 3;
            }
            // Future migrations go here
        }

        // Validate structure
        if (!Array.isArray(parsed.playHistory) ||
            typeof parsed.trackAnalytics !== "object" ||
            !Array.isArray(parsed.favorites) ||
            !Array.isArray(parsed.playlists)) {
            console.warn("Invalid analytics data structure");
            return null;
        }

        return parsed;
    } catch (error) {
        console.error("Failed to load analytics data:", error);
        return null;
    }
}

/**
 * Save analytics data to localStorage for a specific wallet address
 * @param address - Wallet address
 * @param data - Analytics data to save
 */
export function saveAnalyticsData(address: string, data: AnalyticsData): void {
    if (!address) {
        console.warn("Cannot save analytics: no address provided");
        return;
    }

    try {
        const key = `${STORAGE_KEY_PREFIX}${address}`;
        const serialized = JSON.stringify(data);

        localStorage.setItem(key, serialized);
    } catch (error) {
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
            console.error("localStorage quota exceeded. Clearing old analytics data.");

            // Try to clear old data and retry
            try {
                const key = `${STORAGE_KEY_PREFIX}${address}`;

                // Keep only last 25 entries instead of 50
                const reducedData: AnalyticsData = {
                    ...data,
                    playHistory: data.playHistory.slice(0, 25),
                };

                localStorage.setItem(key, JSON.stringify(reducedData));
            } catch (retryError) {
                console.error("Failed to save even with reduced data:", retryError);
            }
        } else {
            console.error("Failed to save analytics data:", error);
        }
    }
}

/**
 * Clear analytics data for a specific wallet address
 * @param address - Wallet address
 */
export function clearAnalyticsData(address: string): void {
    if (!address) return;

    try {
        const key = `${STORAGE_KEY_PREFIX}${address}`;
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear analytics data:", error);
    }
}

/**
 * Get the initial/empty analytics data structure
 * @returns Empty analytics data object
 */
export function getEmptyAnalyticsData(): AnalyticsData {
    return {
        playHistory: [],
        trackAnalytics: {},
        favorites: [],
        playlists: [],
        queue: {
            tracks: [],
            currentIndex: -1,
            repeatMode: 'off',
            shuffleMode: false,
            originalQueue: null,
            savedAt: Date.now()
        },
        queueHistory: [],
        version: CURRENT_VERSION,
    };
}

/**
 * Save queue state to localStorage
 * @param address - Wallet address
 * @param queueData - Queue state to save
 */
export function saveQueue(address: string, queueData: QueueData): void {
    if (!address) return;

    try {
        const analyticsData = loadAnalyticsData(address) || getEmptyAnalyticsData();
        analyticsData.queue = queueData;
        saveAnalyticsData(address, analyticsData);
    } catch (error) {
        console.error("Failed to save queue:", error);
    }
}

/**
 * Load queue state from localStorage
 * @param address - Wallet address
 * @returns Queue state or null if not found
 */
export function loadQueue(address: string): QueueData | null {
    if (!address) return null;

    try {
        const analyticsData = loadAnalyticsData(address);
        return analyticsData?.queue || null;
    } catch (error) {
        console.error("Failed to load queue:", error);
        return null;
    }
}

/**
 * Save queue history to localStorage
 * @param address - Wallet address
 * @param queueHistory - Queue history to save
 */
export function saveQueueHistory(address: string, queueHistory: QueueHistoryItem[]): void {
    if (!address) return;

    try {
        const analyticsData = loadAnalyticsData(address) || getEmptyAnalyticsData();
        analyticsData.queueHistory = queueHistory;
        saveAnalyticsData(address, analyticsData);
    } catch (error) {
        console.error("Failed to save queue history:", error);
    }
}

/**
 * Load queue history from localStorage
 * @param address - Wallet address
 * @returns Queue history or empty array if not found
 */
export function loadQueueHistory(address: string): QueueHistoryItem[] {
    if (!address) return [];

    try {
        const analyticsData = loadAnalyticsData(address);
        return analyticsData?.queueHistory || [];
    } catch (error) {
        console.error("Failed to load queue history:", error);
        return [];
    }
}
