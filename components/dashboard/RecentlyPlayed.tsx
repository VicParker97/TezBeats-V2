"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";
import { formatLastPlayed } from "@/lib/music/utils/analyticsHelpers";
import Image from "next/image";
import type { MusicNFT } from "@/lib/music/types/musicNFT";

interface RecentlyPlayedProps {
    limit?: number;
}

export function RecentlyPlayed({ limit = 10 }: RecentlyPlayedProps) {
    const { getRecentlyPlayed, playHistory, setCurrentTrack, addToQueue, play } = useMusicStore();
    const recentTracks = getRecentlyPlayed(limit);

    const handlePlayTrack = (track: MusicNFT) => {
        setCurrentTrack(track);
        const { queue } = useMusicStore.getState();
        if (!queue.find((t) => t.id === track.id)) {
            addToQueue(track);
        }
        useMusicStore.setState({ queueIndex: queue.length });
        setTimeout(() => play(), 100);
    };

    if (recentTracks.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <Music className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No listening history yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Start playing tracks to see them here
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentTracks.map((track, index) => {
                const historyEntry = playHistory.find((entry) => entry.trackId === track.id);
                const timeAgo = historyEntry ? formatLastPlayed(historyEntry.timestamp) : "";
                const artist = track.audioMetadata.artist || track.creator;

                return (
                    <Card
                        key={`${track.id}-${index}`}
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                        onClick={() => handlePlayTrack(track)}
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={track.image}
                                alt={track.name}
                                fill
                                sizes="200px"
                                className="object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                            />
                            {/* Play button overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    size="icon"
                                    className="h-12 w-12 rounded-full"
                                >
                                    <Play className="h-6 w-6 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="font-medium text-sm truncate">{track.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{artist}</p>
                            {timeAgo && (
                                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
