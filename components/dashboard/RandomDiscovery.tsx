"use client";

import { useState, useEffect } from "react";
import { useMusicStore } from "@/lib/music/musicStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, Music } from "lucide-react";
import { getRandomTrack } from "@/lib/music/utils/analyticsHelpers";
import Image from "next/image";
import type { MusicNFT } from "@/lib/music/types/musicNFT";

export function RandomDiscovery() {
    const { musicNFTs, getRecentlyPlayed, setCurrentTrack, addToQueue, play } = useMusicStore();
    const [randomTrack, setRandomTrack] = useState<MusicNFT | null>(null);

    const refreshRandomTrack = () => {
        const recentIds = getRecentlyPlayed(5).map((t) => t.id);
        const track = getRandomTrack(musicNFTs, recentIds);
        setRandomTrack(track);
    };

    // Initialize random track
    useEffect(() => {
        refreshRandomTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [musicNFTs.length]);

    const handlePlayTrack = () => {
        if (!randomTrack) return;

        setCurrentTrack(randomTrack);
        const { queue } = useMusicStore.getState();
        if (!queue.find((t) => t.id === randomTrack.id)) {
            addToQueue(randomTrack);
        }
        useMusicStore.setState({ queueIndex: queue.length });
        setTimeout(() => play(), 100);
    };

    if (!randomTrack) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shuffle className="h-5 w-5" />
                        Random Discovery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Music className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No tracks to discover</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const artist = randomTrack.audioMetadata.artist || randomTrack.creator;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shuffle className="h-5 w-5" />
                    Random Discovery
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Album Art */}
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                            src={randomTrack.image}
                            alt={randomTrack.name}
                            fill
                            sizes="300px"
                            className="object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                        />
                    </div>

                    {/* Track Info */}
                    <div>
                        <h3 className="font-semibold text-lg truncate">{randomTrack.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{artist}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                            {randomTrack.collection}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button className="flex-1" onClick={handlePlayTrack}>
                            <Play className="h-4 w-4 mr-2" />
                            Play Now
                        </Button>
                        <Button variant="outline" onClick={refreshRandomTrack}>
                            <Shuffle className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
