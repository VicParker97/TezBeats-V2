/**
 * Marketplace utility functions
 * Helpers for marketplace discovery, filtering, and data transformation
 */

import type {
    EditionType,
    MarketplaceFilters,
    MarketplaceSortBy,
    MarketplaceListing,
} from "../types/marketplace";

/**
 * Classify edition type based on supply
 */
export function classifyEditionType(supply: number): EditionType {
    if (supply === 1) return '1/1';
    if (supply > 1000) return 'open';
    return 'limited';
}

/**
 * Build Objkt GraphQL where clause from filters
 */
export function buildMarketplaceWhereClause(filters: MarketplaceFilters): object {
    const conditions: Record<string, unknown>[] = [];

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const priceFilter: Record<string, string> = {};

        if (filters.minPrice !== undefined) {
            // Convert tez to mutez
            const minPriceInMutez = Math.floor(filters.minPrice * 1_000_000).toString();
            priceFilter._gte = minPriceInMutez;
        }

        if (filters.maxPrice !== undefined) {
            // Convert tez to mutez
            const maxPriceInMutez = Math.floor(filters.maxPrice * 1_000_000).toString();
            priceFilter._lte = maxPriceInMutez;
        }

        conditions.push({ price: priceFilter });
    }

    // Collection filter
    if (filters.collection) {
        conditions.push({
            token: {
                fa: {
                    contract: { _eq: filters.collection }
                }
            }
        });
    }

    // Artist filter (creator address)
    if (filters.artist) {
        conditions.push({
            token: {
                creators: {
                    creator_address: { _eq: filters.artist }
                }
            }
        });
    }

    // Time filter
    if (filters.timeFilter === 'recent') {
        // Last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        conditions.push({
            timestamp: { _gte: sevenDaysAgo }
        });
    }
    // Note: 'ending_soon' would require auction data (future enhancement)

    // Edition type filter
    if (filters.editionType && filters.editionType !== 'all') {
        if (filters.editionType === '1/1') {
            conditions.push({
                token: { supply: { _eq: "1" } }
            });
        } else if (filters.editionType === 'open') {
            conditions.push({
                token: { supply: { _gt: "1000" } }
            });
        } else if (filters.editionType === 'limited') {
            conditions.push({
                token: {
                    supply: {
                        _gt: "1",
                        _lte: "1000"
                    }
                }
            });
        }
    }

    // Return the combined conditions
    return conditions.length > 0 ? { _and: conditions } : {};
}

/**
 * Build Objkt GraphQL order_by clause from sort
 */
export function buildMarketplaceOrderBy(sortBy: MarketplaceSortBy): object {
    switch (sortBy) {
        case 'recent':
            return { timestamp: 'desc' };
        case 'price_low':
            return { price: 'asc' };
        case 'price_high':
            return { price: 'desc' };
        case 'trending':
            // TODO: Implement trending algorithm (requires sales data aggregation)
            // For now, fallback to recent
            return { timestamp: 'desc' };
        default:
            return { timestamp: 'desc' };
    }
}

/**
 * Convert mutez to tez
 */
function mutezToTez(mutez: string): string {
    const mutezNum = parseInt(mutez, 10);
    if (isNaN(mutezNum)) return "0.00";

    const tez = mutezNum / 1_000_000;
    return tez.toFixed(2);
}

/**
 * Parse audio metadata from token attributes
 */
function parseAudioMetadata(attributes?: Array<{ attribute: { name: string; value: string } }>): {
    artist?: string;
    genre?: string;
    duration?: string;
} {
    if (!attributes || attributes.length === 0) {
        return {};
    }

    const metadata: { artist?: string; genre?: string; duration?: string } = {};

    for (const attr of attributes) {
        const name = attr.attribute.name.toLowerCase();
        const value = attr.attribute.value;

        if (name === 'artist' || name === 'creator') {
            metadata.artist = value;
        } else if (name === 'genre') {
            metadata.genre = value;
        } else if (name === 'duration') {
            metadata.duration = value;
        }
    }

    return metadata;
}

/**
 * Convert Objkt API listing to MarketplaceListing
 */
export function parseObjktListing(rawListing: {
    id: string;
    price: string;
    timestamp: string;
    seller_address: string;
    token: {
        token_id: string;
        supply: string;
        mime: string;
        name: string;
        description?: string;
        artifact_uri?: string;
        display_uri?: string;
        thumbnail_uri?: string;
        fa: {
            contract: string;
            name: string;
            floor_price?: string;
        };
        attributes?: Array<{ attribute: { name: string; value: string } }>;
        creators?: Array<{
            creator_address: string;
            holder?: { alias?: string };
        }>;
    };
}): MarketplaceListing {
    const supply = parseInt(rawListing.token.supply, 10);
    const editionType = classifyEditionType(supply);

    // Parse audio metadata
    const audioMetadata = parseAudioMetadata(rawListing.token.attributes);

    // Get artist from metadata or first creator
    const artist =
        audioMetadata.artist ||
        (rawListing.token.creators?.[0]?.holder?.alias) ||
        (rawListing.token.creators?.[0]?.creator_address);

    return {
        listingId: rawListing.id,
        tokenId: rawListing.token.token_id,
        contract: rawListing.token.fa.contract,

        // Token Info
        name: rawListing.token.name,
        description: rawListing.token.description || '',
        audioUri: rawListing.token.artifact_uri || '',
        imageUri: rawListing.token.display_uri || rawListing.token.thumbnail_uri || '',

        // Collection
        collectionName: rawListing.token.fa.name,
        collectionContract: rawListing.token.fa.contract,

        // Listing Details
        price: rawListing.price,
        priceInTez: mutezToTez(rawListing.price),
        sellerAddress: rawListing.seller_address,
        listedAt: new Date(rawListing.timestamp).getTime(),

        // Supply
        totalSupply: supply,
        editionType,

        // Audio metadata
        audioMetadata: {
            artist,
            genre: audioMetadata.genre,
            duration: audioMetadata.duration,
        },
    };
}

/**
 * Format timestamp as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
