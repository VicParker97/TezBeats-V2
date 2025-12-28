"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Heart, Info } from "lucide-react";
import type { MusicNFT } from "@/lib/music/types/musicNFT";
import { useMusicStore } from "@/lib/music/musicStore";
import { useState } from "react";
import { TrackDetailModal } from "./TrackDetailModal";

interface MusicNFTCardProps {
    nft: MusicNFT;
}

export function MusicNFTCard({ nft }: MusicNFTCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const { setCurrentTrack, addToQueue, play, queue, toggleFavorite, favorites } = useMusicStore();
    const isFavorite = favorites.includes(nft.id);

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

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(nft.id);
    };

    const handleShowDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(true);
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

                {/* Play button overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full"
                            onClick={handlePlay}
                        >
                            <Play className="h-6 w-6 ml-0.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-10 w-10 rounded-full"
                            onClick={handleAddToQueue}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant={isFavorite ? "default" : "secondary"}
                            className="h-10 w-10 rounded-full"
                            onClick={handleToggleFavorite}
                        >
                            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-10 w-10 rounded-full"
                            onClick={handleShowDetails}
                        >
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                {/* Duration badge */}
                {duration && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {duration}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3">
                <div className="w-full">
                    <h3 className="font-medium text-sm truncate">{nft.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{artist}</p>
                    <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                </div>
            </CardFooter>

            <TrackDetailModal track={nft} open={showDetails} onOpenChange={setShowDetails} />
        </Card>
    );
}
