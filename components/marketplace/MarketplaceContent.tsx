"use client";

import { useEffect, useState, useMemo } from "react";
import { useMusicStore } from "@/lib/music/musicStore";
import { MarketplaceListingCard } from "./MarketplaceListingCard";
import { MarketplaceFilterBar } from "./MarketplaceFilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, AlertCircle, Loader2, Search } from "lucide-react";

export function MarketplaceContent() {
    const {
        marketplaceListings,
        isLoadingMarketplaceListings,
        marketplaceError,
        marketplaceTotalCount,
        marketplaceHasMore,
        fetchMarketplaceListings,
        loadMoreMarketplaceListings,
        marketplaceSearchQuery,
        setMarketplaceSearchQuery,
    } = useMusicStore();

    // Local search state for debouncing
    const [searchInput, setSearchInput] = useState("");

    // Debounce search: Update store after 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setMarketplaceSearchQuery(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput, setMarketplaceSearchQuery]);

    // Client-side search filtering
    const filteredListings = useMemo(() => {
        if (!marketplaceSearchQuery) return marketplaceListings;

        const query = marketplaceSearchQuery.toLowerCase();
        return marketplaceListings.filter(listing =>
            listing.name.toLowerCase().includes(query) ||
            listing.audioMetadata.artist?.toLowerCase().includes(query)
        );
    }, [marketplaceListings, marketplaceSearchQuery]);

    // Fetch listings on mount
    useEffect(() => {
        if (marketplaceListings.length === 0 && !isLoadingMarketplaceListings) {
            fetchMarketplaceListings(true);
        }
    }, [marketplaceListings.length, isLoadingMarketplaceListings, fetchMarketplaceListings]);

    // Loading state - initial load
    if (isLoadingMarketplaceListings && marketplaceListings.length === 0) {
        return (
            <div className="space-y-6">
                {/* Results count skeleton */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-square rounded-lg" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (marketplaceError) {
        return (
            <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Failed to Load Listings</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        {marketplaceError}
                    </p>
                    <Button onClick={() => fetchMarketplaceListings(true)}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (marketplaceListings.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Music className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        No music NFTs are currently available on the marketplace. Try adjusting
                        your filters or check back later.
                    </p>
                    <Button onClick={() => fetchMarketplaceListings(true)}>
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search tracks or artists..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Filter Bar */}
            <MarketplaceFilterBar />

            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {marketplaceSearchQuery && `Found ${filteredListings.length} of `}
                    {marketplaceListings.length} listings
                </p>
            </div>

            {/* Listings grid - use filteredListings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing) => (
                    <MarketplaceListingCard key={listing.listingId} listing={listing} />
                ))}
            </div>

            {/* Load More button - hide if searching */}
            {!marketplaceSearchQuery && marketplaceHasMore && (
                <div className="flex justify-center pt-6">
                    <Button
                        variant="outline"
                        onClick={loadMoreMarketplaceListings}
                        disabled={isLoadingMarketplaceListings}
                    >
                        {isLoadingMarketplaceListings ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
