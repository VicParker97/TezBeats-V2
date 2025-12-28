"use client";

import Image from "next/image";
import { ExternalLink, Music2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpenEditionBadge } from "./OpenEditionBadge";
import { formatRelativeTime, truncateAddress } from "@/lib/music/utils/marketplaceUtils";
import type { MarketplaceListing } from "@/lib/music/types/marketplace";

interface MarketplaceListingCardProps {
    listing: MarketplaceListing;
}

export function MarketplaceListingCard({ listing }: MarketplaceListingCardProps) {
    const objktUrl = `https://objkt.com/tokens/${listing.contract}/${listing.tokenId}`;

    const handleCardClick = () => {
        window.open(objktUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <Card
            className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={handleCardClick}
        >
            <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                    {/* Open Edition Badge - Top Left */}
                    {listing.editionType === "open" && (
                        <div className="absolute top-2 left-2 z-10">
                            <OpenEditionBadge supply={listing.totalSupply} />
                        </div>
                    )}

                    {/* Listed Time - Bottom Right */}
                    <div className="absolute bottom-2 right-2 z-10">
                        <Badge
                            variant="secondary"
                            className="bg-black/70 text-white text-xs backdrop-blur-sm"
                        >
                            {formatRelativeTime(listing.listedAt)}
                        </Badge>
                    </div>

                    {/* Cover Image */}
                    {listing.imageUri ? (
                        <Image
                            src={listing.imageUri.replace("ipfs://", "https://ipfs.io/ipfs/")}
                            alt={listing.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-2">
                    {/* Track Name */}
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {listing.name}
                    </h3>

                    {/* Artist */}
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {listing.audioMetadata.artist || "Unknown Artist"}
                    </p>

                    {/* Price & Seller Row */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                            {/* Price Badge */}
                            <Badge className="bg-blue-500/90 text-white hover:bg-blue-500 font-mono text-xs">
                                {listing.priceInTez} ꜩ
                            </Badge>
                        </div>

                        {/* Edition Info */}
                        {listing.editionType !== "open" && (
                            <span className="text-xs text-muted-foreground">
                                {listing.editionType === "1/1" ? "1/1" : `Ed. ${listing.totalSupply}`}
                            </span>
                        )}
                    </div>

                    {/* Seller */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                        <span>Seller:</span>
                        <span className="font-mono">{truncateAddress(listing.sellerAddress)}</span>
                    </div>

                    {/* View on Objkt Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(objktUrl, "_blank", "noopener,noreferrer");
                        }}
                    >
                        View on Objkt
                        <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
