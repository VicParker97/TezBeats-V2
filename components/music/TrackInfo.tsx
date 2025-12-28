"use client";

import Image from "next/image";
import { useMusicStore } from "@/lib/music/musicStore";
import { Music } from "lucide-react";

interface TrackInfoProps {
    className?: string;
    compact?: boolean;
}

export function TrackInfo({ className, compact = false }: TrackInfoProps) {
    const { currentTrack } = useMusicStore();

    if (!currentTrack) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className={`flex items-center justify-center rounded-md bg-muted ${compact ? 'h-10 w-10' : 'h-16 w-16'}`}>
                    <Music className={`text-muted-foreground ${compact ? 'h-5 w-5' : 'h-8 w-8'}`} />
                </div>
                {!compact && (
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">No track playing</p>
                        <p className="text-xs text-muted-foreground">Select a track to start</p>
                    </div>
                )}
            </div>
        );
    }

    const artist = currentTrack.audioMetadata.artist || currentTrack.creator;
    const genre = currentTrack.audioMetadata.genre;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Album Art */}
            <div className={`relative flex-shrink-0 overflow-hidden rounded ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}>
                <Image
                    src={currentTrack.image}
                    alt={currentTrack.name}
                    fill
                    sizes={compact ? "40px" : "48px"}
                    className="object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                />
            </div>

            {/* Track Details */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${compact ? 'text-xs' : 'text-sm'}`}>{currentTrack.name}</h3>
                <p className={`text-muted-foreground truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>{artist}</p>
                {!compact && (
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-muted-foreground truncate">{currentTrack.collection}</p>
                        {genre && (
                            <>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <p className="text-[10px] text-muted-foreground">{genre}</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
