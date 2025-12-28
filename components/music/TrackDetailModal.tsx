"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { MusicNFT } from "@/lib/music/types/musicNFT";
import { formatRoyalties, getTotalRoyaltyPercentage, truncateAddress } from "@/lib/music/utils/royaltiesUtils";
import { useState, useEffect } from "react";
import { MarketplaceInfoSection } from "./MarketplaceInfoSection";
import { useMusicStore } from "@/lib/music/musicStore";

interface TrackDetailModalProps {
    track: MusicNFT | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TrackDetailModal({ track, open, onOpenChange }: TrackDetailModalProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const {
        marketplaceDataCache,
        isLoadingMarketplace,
        fetchMarketplaceData,
    } = useMusicStore();

    // Fetch marketplace data when modal opens
    useEffect(() => {
        if (open && track) {
            const cacheKey = `${track.contract}:${track.tokenId}`;
            if (!marketplaceDataCache.has(cacheKey)) {
                fetchMarketplaceData(track);
            }
        }
    }, [open, track, marketplaceDataCache, fetchMarketplaceData]);

    if (!track) return null;

    const cacheKey = `${track.contract}:${track.tokenId}`;
    const marketplaceData = marketplaceDataCache.get(cacheKey);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const artist = track.audioMetadata.artist || track.creator;
    const royaltyShares = track.metadata.royalties ? formatRoyalties(track.metadata.royalties) : [];
    const totalRoyalty = track.metadata.royalties ? getTotalRoyaltyPercentage(track.metadata.royalties) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{track.name}</DialogTitle>
                    <DialogDescription>{artist}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Album Art */}
                    <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-lg">
                        <Image
                            src={track.image}
                            alt={track.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 448px"
                            priority
                            unoptimized
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                        />
                    </div>

                    {/* Description */}
                    {track.description && (
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground">{track.description}</p>
                        </div>
                    )}

                    {/* NFT Information */}
                    <div className="grid gap-4">
                        <h3 className="font-semibold text-sm">NFT Information</h3>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Collection</p>
                                <p className="font-medium">{track.collection}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground mb-1">Token Standard</p>
                                <Badge variant="outline" className="uppercase">
                                    {track.standard}
                                </Badge>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground mb-1">Contract Address</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-2 py-1 bg-muted rounded text-xs font-mono">
                                        {truncateAddress(track.contract, 10, 8)}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => copyToClipboard(track.contract, "contract")}
                                    >
                                        {copied === "contract" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        asChild
                                    >
                                        <a
                                            href={`https://tzkt.io/${track.contract}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on TzKT"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <p className="text-muted-foreground mb-1">Token ID</p>
                                <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{track.tokenId}</code>
                            </div>

                            <div>
                                <p className="text-muted-foreground mb-1">Balance</p>
                                <p className="font-medium">{track.balance}</p>
                            </div>
                        </div>
                    </div>

                    {/* Audio Metadata */}
                    {(track.audioMetadata.genre || track.audioMetadata.album || track.audioMetadata.year || track.audioMetadata.duration) && (
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-sm">Audio Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {track.audioMetadata.genre && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Genre</p>
                                        <Badge>{track.audioMetadata.genre}</Badge>
                                    </div>
                                )}
                                {track.audioMetadata.album && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Album</p>
                                        <p className="font-medium">{track.audioMetadata.album}</p>
                                    </div>
                                )}
                                {track.audioMetadata.year && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Year</p>
                                        <p className="font-medium">{track.audioMetadata.year}</p>
                                    </div>
                                )}
                                {track.audioMetadata.duration && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Duration</p>
                                        <p className="font-medium">{track.audioMetadata.duration}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Marketplace Information */}
                    <div className="border-t pt-6">
                        <MarketplaceInfoSection
                            data={marketplaceData}
                            isLoading={isLoadingMarketplace}
                        />
                    </div>

                    {/* Royalties */}
                    {royaltyShares.length > 0 && (
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Royalties</h3>
                                {totalRoyalty && (
                                    <Badge variant="secondary">Total: {totalRoyalty}</Badge>
                                )}
                            </div>
                            <div className="space-y-2">
                                {royaltyShares.map((share, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <code className="font-mono text-xs truncate">
                                                {truncateAddress(share.address)}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 flex-shrink-0"
                                                onClick={() => copyToClipboard(share.address, `royalty-${index}`)}
                                            >
                                                {copied === `royalty-${index}` ? (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                        </div>
                                        <Badge>{share.percentage}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attributes */}
                    {track.metadata.attributes && track.metadata.attributes.length > 0 && (
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-sm">Attributes</h3>
                            <div className="flex flex-wrap gap-2">
                                {track.metadata.attributes.map((attr, index) => (
                                    <Badge key={index} variant="outline">
                                        {attr.name}: {attr.value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Creators */}
                    {track.metadata.creators && track.metadata.creators.length > 0 && (
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-sm">Creators</h3>
                            <div className="space-y-2">
                                {track.metadata.creators.map((creator, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                                    >
                                        <code className="font-mono text-xs flex-1 truncate">{creator}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(creator, `creator-${index}`)}
                                        >
                                            {copied === `creator-${index}` ? (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}
