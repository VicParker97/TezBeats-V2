"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Heart, Info, ListPlus, Check, Clock, MoreVertical } from "lucide-react";
import type { MusicNFT } from "@/lib/music/types/musicNFT";
import { useMusicStore } from "@/lib/music/musicStore";
import { useState, useEffect } from "react";
import { TrackDetailModal } from "./TrackDetailModal";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { PriceBadge } from "./PriceBadge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MusicNFTCardProps {
    nft: MusicNFT;
}

export function MusicNFTCard({ nft }: MusicNFTCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
    const {
        setCurrentTrack,
        addToQueue,
        insertNext,
        play,
        queue,
        toggleFavorite,
        favorites,
        playlists,
        addToPlaylist,
        marketplaceDataCache,
        fetchMarketplaceData,
    } = useMusicStore();
    const isFavorite = favorites.includes(nft.id);

    // Get marketplace data from cache
    const cacheKey = `${nft.contract}:${nft.tokenId}`;
    const marketplaceData = marketplaceDataCache.get(cacheKey);

    // Auto-fetch marketplace data on mount if not already cached
    useEffect(() => {
        if (!marketplaceData && !hasAttemptedFetch) {
            setHasAttemptedFetch(true);
            fetchMarketplaceData(nft);
        }
    }, [nft, marketplaceData, hasAttemptedFetch, fetchMarketplaceData]);

    const handlePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();

        // Check if track is already in queue
        const existingIndex = queue.findIndex((track) => track.id === nft.id);

        if (existingIndex === -1) {
            // Track not in queue - add it
            addToQueue(nft);
            setCurrentTrack(nft);
            useMusicStore.setState({ queueIndex: queue.length });
        } else {
            // Track already in queue - just play it
            setCurrentTrack(nft);
            useMusicStore.setState({ queueIndex: existingIndex });
        }

        // Trigger play
        setTimeout(() => {
            play();
        }, 100);
    };

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToQueue(nft);
    };

    const handlePlayNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        insertNext(nft);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(nft.id);
    };

    const handleShowDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(true);
    };

    const handleAddToPlaylist = (playlistId: string) => {
        addToPlaylist(playlistId, nft.id);
    };

    const handleCreateNewPlaylist = (newPlaylistId: string) => {
        addToPlaylist(newPlaylistId, nft.id);
    };

    const artist = nft.audioMetadata.artist || nft.creator;
    const duration = nft.audioMetadata.duration;

    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-0 relative">
                <div className="aspect-square w-full relative">
                    <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        loading="lazy"
                        unoptimized
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                    />
                </div>

                {/* Play button overlay - Only on hover */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full"
                            onClick={handlePlay}
                        >
                            <Play className="h-7 w-7 ml-0.5" />
                        </Button>
                    </div>
                )}

                {/* Duration badge */}
                {duration && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {duration}
                    </div>
                )}

                {/* Edition badge (top-left) - Always show, with marketplace data if available */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                    {marketplaceData && marketplaceData.totalSupply > 0
                        ? `${nft.balance}/${marketplaceData.totalSupply}`
                        : `${nft.balance}/${nft.balance}`}
                </div>

                {/* Price badge (bottom-left) */}
                {marketplaceData && marketplaceData.isListed && marketplaceData.currentListing && (
                    <div className="absolute bottom-2 left-2">
                        <PriceBadge
                            price={marketplaceData.currentListing.priceInTez}
                            label="Listed"
                            variant="listing"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 flex flex-col gap-2">
                <div className="w-full">
                    <h3 className="font-medium text-sm truncate">{nft.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{artist}</p>
                    <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                </div>

                {/* Action buttons */}
                <div className="w-full flex items-center gap-1">
                    {/* Queue dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Queue
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                            <DropdownMenuItem onClick={handlePlayNext}>
                                <Clock className="h-4 w-4 mr-2" />
                                Play Next
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddToQueue}>
                                <ListPlus className="h-4 w-4 mr-2" />
                                Add to Queue
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Playlist dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ListPlus className="h-3.5 w-3.5 mr-1" />
                                Playlist
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                            {playlists.length > 0 ? (
                                <>
                                    {playlists.map((playlist) => {
                                        const isInPlaylist = playlist.trackIds.includes(nft.id);
                                        return (
                                            <DropdownMenuItem
                                                key={playlist.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToPlaylist(playlist.id);
                                                }}
                                                className="flex items-center justify-between"
                                            >
                                                <span className="truncate">{playlist.name}</span>
                                                {isInPlaylist && (
                                                    <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator />
                                </>
                            ) : null}
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCreatePlaylist(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Playlist
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Favorite button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleToggleFavorite}
                    >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>

                    {/* More menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleShowDetails}>
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>

            <TrackDetailModal track={nft} open={showDetails} onOpenChange={setShowDetails} />

            <CreatePlaylistDialog
                open={showCreatePlaylist}
                onOpenChange={setShowCreatePlaylist}
                onSuccess={handleCreateNewPlaylist}
            />
        </Card>
    );
}
