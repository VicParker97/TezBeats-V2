"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import Image from "next/image";

interface TopArtistsProps {
    limit?: number;
}

export function TopArtists({ limit = 6 }: TopArtistsProps) {
    const { getTopArtists } = useMusicStore();
    const topArtists = getTopArtists(limit);

    if (topArtists.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <Music className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Your top artists will appear as you listen
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topArtists.map((artistStats, index) => {
                // Use first track's image as representative
                const coverImage = artistStats.tracks[0]?.image || "/placeholder.svg";

                return (
                    <Card key={`${artistStats.artist}-${index}`} className="overflow-hidden">
                        <CardContent className="p-0">
                            {/* Artist Image */}
                            <div className="relative aspect-square">
                                <Image
                                    src={coverImage}
                                    alt={artistStats.artist}
                                    fill
                                    sizes="200px"
                                    className="object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                            </div>

                            {/* Artist Info */}
                            <div className="p-3">
                                <h4 className="font-semibold text-sm truncate">
                                    {artistStats.artist}
                                </h4>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">
                                        {artistStats.trackCount} {artistStats.trackCount === 1 ? "track" : "tracks"}
                                    </p>
                                    {artistStats.playCount > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {artistStats.playCount} {artistStats.playCount === 1 ? "play" : "plays"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
