/**
 * Objkt.com GraphQL API Client
 * Fetches NFT marketplace data including listings, sales, and floor prices
 */

import type {
    MarketplaceData,
    ObjktTokenResponse,
    ObjktSale,
    MarketplaceListingsResponse,
    MarketplaceFilters,
    MarketplaceSortBy,
} from "../types/marketplace";
import {
    buildMarketplaceWhereClause,
    buildMarketplaceOrderBy,
    parseObjktListing,
} from "../utils/marketplaceUtils";

const OBJKT_GRAPHQL_ENDPOINT = "https://data.objkt.com/v3/graphql";

/**
 * Execute a GraphQL query against Objkt.com API
 */
async function queryObjkt<T>(
    query: string,
    variables: Record<string, unknown>
): Promise<T> {
    const response = await fetch(OBJKT_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new Error(`Objkt API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
}

/**
 * Convert mutez (smallest Tezos unit) to tez
 * 1 tez = 1,000,000 mutez
 */
function mutezToTez(mutez: string): string {
    const mutezNum = parseInt(mutez, 10);
    if (isNaN(mutezNum)) return "0";

    const tez = mutezNum / 1_000_000;
    return tez.toFixed(2);
}

/**
 * Fetch comprehensive marketplace data for a specific token
 */
export async function fetchTokenMarketplaceData(
    contract: string,
    tokenId: string
): Promise<MarketplaceData> {
    // Query for token info and listings
    const tokenQuery = `
        query GetTokenInfo($contract: String!, $tokenId: String!) {
            token(where: {
                fa_contract: {_eq: $contract},
                token_id: {_eq: $tokenId}
            }) {
                supply
                listings(
                    where: {status: {_eq: "active"}},
                    order_by: {price: asc},
                    limit: 1
                ) {
                    price
                    seller_address
                    marketplace_contract
                    status
                }
                fa {
                    floor_price
                }
            }
        }
    `;

    // Query for sales events (separate from token)
    const eventsQuery = `
        query GetTokenEvents($contract: String!, $tokenId: String!) {
            event(
                where: {
                    fa_contract: {_eq: $contract},
                    token_id: {_eq: $tokenId},
                    implements: {_eq: "SALE"}
                },
                order_by: {timestamp: desc},
                limit: 10
            ) {
                price
                timestamp
                buyer_address
                seller_address
            }
        }
    `;

    // Fetch token data
    const tokenData = await queryObjkt<ObjktTokenResponse>(tokenQuery, {
        contract,
        tokenId,
    });

    if (!tokenData.token || tokenData.token.length === 0) {
        throw new Error("Token not found");
    }

    const token = tokenData.token[0];

    // Fetch sales events
    let salesEvents: ObjktSale[] = [];
    try {
        const eventsData = await queryObjkt<{ event: ObjktSale[] }>(eventsQuery, {
            contract,
            tokenId,
        });
        salesEvents = eventsData.event || [];
    } catch (error) {
        console.warn("Failed to fetch sales events:", error);
        // Continue without sales data
    }

    // Process listings
    const currentListing: MarketplaceData["currentListing"] = token.listings?.[0]
        ? {
              price: token.listings[0].price,
              priceInTez: mutezToTez(token.listings[0].price),
              seller: token.listings[0].seller_address,
              marketplace: token.listings[0].marketplace_contract,
              listingId: token.listings[0].status || "",
          }
        : undefined;

    // Process sales from events
    const recentSales = salesEvents.map((sale) => ({
        price: sale.price,
        priceInTez: mutezToTez(sale.price),
        timestamp: new Date(sale.timestamp).getTime(),
    }));

    const lastSale: MarketplaceData["lastSale"] = salesEvents[0]
        ? {
              price: salesEvents[0].price,
              priceInTez: mutezToTez(salesEvents[0].price),
              timestamp: new Date(salesEvents[0].timestamp).getTime(),
              buyer: salesEvents[0].buyer_address,
              seller: salesEvents[0].seller_address,
          }
        : undefined;

    // Process floor price
    const floorPrice: MarketplaceData["floorPrice"] = token.fa?.floor_price
        ? {
              price: token.fa.floor_price,
              priceInTez: mutezToTez(token.fa.floor_price),
          }
        : undefined;

    return {
        totalSupply: parseInt(token.supply, 10),
        ownedEditions: 0, // This would require wallet-specific query
        isListed: !!currentListing,
        currentListing,
        lastSale,
        recentSales,
        floorPrice,
        marketplaceLinks: {
            objkt: `https://objkt.com/tokens/${contract}/${tokenId}`,
        },
    };
}

/**
 * Fetch floor price for an entire collection
 */
export async function fetchCollectionFloorPrice(
    contract: string
): Promise<string | null> {
    const query = `
        query GetCollectionFloorPrice($contract: String!) {
            fa(where: {contract: {_eq: $contract}}) {
                floor_price
            }
        }
    `;

    const data = await queryObjkt<{ fa: Array<{ floor_price?: string }> }>(query, {
        contract,
    });

    if (!data.fa || data.fa.length === 0 || !data.fa[0].floor_price) {
        return null;
    }

    return mutezToTez(data.fa[0].floor_price);
}

/**
 * Batch fetch marketplace data for multiple tokens
 * More efficient than individual calls
 */
export async function fetchBatchMarketplaceData(
    tokens: Array<{ contract: string; tokenId: string }>
): Promise<Map<string, MarketplaceData>> {
    const results = new Map<string, MarketplaceData>();

    // Process in batches to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);

        // Execute batch in parallel
        const batchPromises = batch.map(async ({ contract, tokenId }) => {
            try {
                const data = await fetchTokenMarketplaceData(contract, tokenId);
                const key = `${contract}:${tokenId}`;
                results.set(key, data);
            } catch (error) {
                console.error(
                    `Failed to fetch marketplace data for ${contract}:${tokenId}`,
                    error
                );
            }
        });

        await Promise.all(batchPromises);

        // Rate limiting: wait 500ms between batches
        if (i + BATCH_SIZE < tokens.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    return results;
}

/**
 * Fetch marketplace listings (discovery)
 * Discovers active audio NFT listings with filtering and sorting
 */
export async function fetchMarketplaceListings(
    limit: number = 24,
    offset: number = 0,
    filters?: MarketplaceFilters,
    sortBy: MarketplaceSortBy = 'recent'
): Promise<MarketplaceListingsResponse> {
    // Build where clause from filters
    const filterWhere = filters ? buildMarketplaceWhereClause(filters) : {};

    // Build the complete where clause
    const baseConditions: unknown[] = [
        { status: { _eq: "active" } },
        { token: { mime: { _like: "audio%" } } }
    ];

    // If filterWhere has conditions, merge them
    if (Object.keys(filterWhere).length > 0 && '_and' in filterWhere) {
        baseConditions.push(...((filterWhere as { _and: unknown[] })._and || []));
    }

    // Build order by clause
    const orderBy = buildMarketplaceOrderBy(sortBy);

    console.log('[Marketplace] Filters:', filters);
    console.log('[Marketplace] Where clause:', JSON.stringify({ _and: baseConditions }, null, 2));
    console.log('[Marketplace] Order by:', orderBy);

    const query = `
        query DiscoverAudioListings($limit: Int!, $offset: Int!, $where: listing_bool_exp, $orderBy: [listing_order_by!]) {
            listing(
                where: $where
                limit: $limit
                offset: $offset
                order_by: $orderBy
            ) {
                id
                price
                timestamp
                seller_address
                token {
                    token_id
                    supply
                    mime
                    name
                    description
                    artifact_uri
                    display_uri
                    thumbnail_uri
                    fa {
                        contract
                        name
                        floor_price
                    }
                    attributes {
                        attribute {
                            name
                            value
                        }
                    }
                    creators {
                        creator_address
                        holder {
                            alias
                        }
                    }
                }
            }
        }
    `;

    console.log('[Marketplace] Fetching listings with limit:', limit, 'offset:', offset);

    const data = await queryObjkt<{
        listing: unknown[];
    }>(query, {
        limit,
        offset,
        where: { _and: baseConditions },
        orderBy: [orderBy],
    });

    console.log('[Marketplace] Response data:', JSON.stringify(data, null, 2));
    console.log('[Marketplace] Number of listings:', data.listing.length);

    // Parse listings (already sorted by id desc from GraphQL query)
    const listings = data.listing.map((rawListing) => {
        console.log('[Marketplace] Parsing listing:', rawListing);
        return parseObjktListing(rawListing as Parameters<typeof parseObjktListing>[0]);
    });

    console.log('[Marketplace] First listing (should be most recent):', listings[0]);

    // Determine if there are more results
    // If we got a full page of results, there might be more
    const hasMore = listings.length === limit;

    // Estimate total count (not exact, but good enough for UI)
    const estimatedTotal = hasMore ? offset + listings.length + 1 : offset + listings.length;

    return {
        listings,
        total: estimatedTotal,
        hasMore,
    };
}
