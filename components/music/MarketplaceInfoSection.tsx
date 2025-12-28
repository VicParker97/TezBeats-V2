"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceBadge } from "./PriceBadge";
import type { MarketplaceData } from "@/lib/music/types/marketplace";

interface MarketplaceInfoSectionProps {
    data?: MarketplaceData;
    isLoading?: boolean;
    error?: string | null;
}

export function MarketplaceInfoSection({
    data,
    isLoading,
    error,
}: MarketplaceInfoSectionProps) {
    const [showAllSales, setShowAllSales] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h3 className="font-semibold">Marketplace Information</h3>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-2">
                <h3 className="font-semibold">Marketplace Information</h3>
                <p className="text-sm text-muted-foreground">
                    Unable to load marketplace data. {error}
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const displaySales = showAllSales
        ? data.recentSales
        : data.recentSales.slice(0, 5);

    const formatTimestamp = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Marketplace Information</h3>

            <div className="grid gap-3 text-sm">
                {/* Edition Info */}
                {data.totalSupply > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Edition:</span>
                        <span className="font-medium">
                            {data.ownedEditions > 0
                                ? `${data.ownedEditions} of ${data.totalSupply}`
                                : `1 of ${data.totalSupply}`}
                        </span>
                    </div>
                )}

                {/* Current Listing */}
                {data.isListed && data.currentListing && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Current Listing:</span>
                            <PriceBadge
                                price={data.currentListing.priceInTez}
                                variant="listing"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Seller:</span>
                            <span className="font-mono">
                                {truncateAddress(data.currentListing.seller)}
                            </span>
                        </div>
                    </>
                )}

                {/* Last Sale */}
                {data.lastSale && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Last Sale:</span>
                            <PriceBadge
                                price={data.lastSale.priceInTez}
                                variant="sale"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">When:</span>
                            <span>{formatTimestamp(data.lastSale.timestamp)}</span>
                        </div>
                    </>
                )}

                {/* Floor Price */}
                {data.floorPrice && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Collection Floor:</span>
                        <PriceBadge
                            price={data.floorPrice.priceInTez}
                            variant="floor"
                        />
                    </div>
                )}

                {/* Sales History */}
                {data.recentSales.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground font-medium">
                                Sales History
                            </span>
                            {data.recentSales.length > 5 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAllSales(!showAllSales)}
                                    className="h-auto p-0 text-xs"
                                >
                                    {showAllSales ? (
                                        <>
                                            Show Less <ChevronUp className="ml-1 h-3 w-3" />
                                        </>
                                    ) : (
                                        <>
                                            Show All <ChevronDown className="ml-1 h-3 w-3" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {displaySales.map((sale, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center text-xs py-1 border-b last:border-0"
                                >
                                    <span className="text-muted-foreground">
                                        {formatTimestamp(sale.timestamp)}
                                    </span>
                                    <span className="font-mono font-medium">
                                        {sale.priceInTez} ꜩ
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Marketplace Links */}
                <div className="mt-4 pt-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <a
                            href={data.marketplaceLinks.objkt}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View on Objkt.com
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
