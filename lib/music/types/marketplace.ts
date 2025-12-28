/**
 * Marketplace data types for NFT pricing and sales information
 * Fetched from Objkt.com GraphQL API
 */

export interface MarketplaceData {
    // Supply Information
    totalSupply: number;
    ownedEditions: number;

    // Listing Information
    isListed: boolean;
    currentListing?: {
        price: string;              // In mutez (1 tez = 1,000,000 mutez)
        priceInTez: string;         // Human-readable (e.g., "5.5")
        seller: string;             // Address
        marketplace: string;        // "objkt" etc
        listingId: string;
    };

    // Sales History
    lastSale?: {
        price: string;
        priceInTez: string;
        timestamp: number;
        buyer: string;
        seller: string;
    };
    recentSales: Array<{
        price: string;
        priceInTez: string;
        timestamp: number;
    }>;

    // Collection Stats
    floorPrice?: {
        price: string;
        priceInTez: string;
    };

    // Marketplace Links
    marketplaceLinks: {
        objkt: string;
        // Future: teia, oneof, etc.
    };
}

/**
 * Objkt.com GraphQL API response types
 */

export interface ObjktToken {
    supply: string;
    listings?: ObjktListing[];
    sales?: ObjktSale[];
    fa?: {
        floor_price?: string;
    };
}

export interface ObjktListing {
    price: string;
    seller_address: string;
    marketplace_contract: string;
    listing_id?: string;
    status?: string;
}

export interface ObjktSale {
    price: string;
    timestamp: string;
    buyer_address: string;
    seller_address: string;
}

export interface ObjktTokenResponse {
    token: ObjktToken[];
}

/**
 * Marketplace Discovery Types (for browsing listings)
 */

export type EditionType = '1/1' | 'limited' | 'open';

export interface MarketplaceListing {
    listingId: string;
    tokenId: string;
    contract: string;

    // Token Info
    name: string;
    description: string;
    audioUri: string;
    imageUri: string;

    // Collection
    collectionName: string;
    collectionContract: string;

    // Listing Details
    price: string;          // mutez
    priceInTez: string;     // human-readable
    sellerAddress: string;
    listedAt: number;       // timestamp

    // Supply
    totalSupply: number;
    editionType: EditionType;

    // Audio metadata (parsed from token)
    audioMetadata: {
        artist?: string;
        genre?: string;
        duration?: string;
    };
}

export interface MarketplaceFilters {
    minPrice?: number;      // in tez
    maxPrice?: number;      // in tez
    collection?: string;
    artist?: string;
    timeFilter?: 'recent' | 'ending_soon' | 'all';
    editionType?: EditionType | 'all';
}

export type MarketplaceSortBy =
    | 'recent'
    | 'price_low'
    | 'price_high'
    | 'trending';

export interface MarketplaceListingsResponse {
    listings: MarketplaceListing[];
    total: number;
    hasMore: boolean;
}
