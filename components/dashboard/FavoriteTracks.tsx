"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import { MusicNFTCard } from "@/components/music/MusicNFTCard";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface FavoriteTracksProps {
    limit?: number;
}

export function FavoriteTracks({ limit = 8 }: FavoriteTracksProps) {
    const { getFavoriteTracks } = useMusicStore();
    const favoriteTracks = getFavoriteTracks().slice(0, limit);

    if (favoriteTracks.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No favorite tracks yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Mark tracks as favorites to see them here
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteTracks.map((track) => (
                <MusicNFTCard key={track.id} nft={track} />
            ))}
        </div>
    );
}
