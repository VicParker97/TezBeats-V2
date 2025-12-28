import type { AnalyticsData } from "../types/analytics";

const STORAGE_KEY_PREFIX = "tezbeat_analytics_";
const CURRENT_VERSION = 1;

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
            // Add migration logic here if schema changes in future
            parsed.version = CURRENT_VERSION;
        }

        // Validate structure
        if (!Array.isArray(parsed.playHistory) ||
            typeof parsed.trackAnalytics !== "object" ||
            !Array.isArray(parsed.favorites)) {
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
        version: CURRENT_VERSION,
    };
}
