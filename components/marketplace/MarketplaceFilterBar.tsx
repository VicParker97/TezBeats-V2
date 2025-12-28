"use client";

import { SortDropdown } from "./SortDropdown";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { EditionTypeFilter } from "./EditionTypeFilter";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";

export function MarketplaceFilterBar() {
    const { marketplaceFilters, marketplaceSortBy, clearMarketplaceFilters } = useMusicStore();

    // Check if any filters are active
    const hasFilters =
        marketplaceFilters.minPrice !== undefined ||
        marketplaceFilters.maxPrice !== undefined ||
        (marketplaceFilters.editionType && marketplaceFilters.editionType !== 'all') ||
        marketplaceSortBy !== 'recent';

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
            {/* Edition Type Filter */}
            <EditionTypeFilter />

            {/* Price Range Filter */}
            <PriceRangeFilter />

            {/* Sort Dropdown */}
            <div className="ml-auto">
                <SortDropdown />
            </div>

            {/* Clear Filters Button */}
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMarketplaceFilters}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
