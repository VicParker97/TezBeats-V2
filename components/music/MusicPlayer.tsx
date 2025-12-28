"use client";

import { Card } from "@/components/ui/card";
import { WaveformPlayer } from "./WaveformPlayer";
import { PlayerControls } from "./PlayerControls";
import { TrackInfo } from "./TrackInfo";
import { useMusicStore } from "@/lib/music/musicStore";

interface MusicPlayerProps {
    className?: string;
}

export function MusicPlayer({ className }: MusicPlayerProps) {
    const { currentTrack } = useMusicStore();

    return (
        <>
            {/* Hidden audio element - always mounted */}
            <WaveformPlayer />

            {/* Visible player UI - only shown when track is playing */}
            {currentTrack && (
                <Card className={`fixed bottom-0 left-64 right-0 z-50 border-t rounded-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ${className}`}>
                    <div className="px-3 py-1.5">
                        <div className="flex items-center gap-3">
                            {/* Track Info - Compact */}
                            <div className="flex-shrink-0 w-52">
                                <TrackInfo />
                            </div>

                            {/* Player Controls - Center */}
                            <div className="flex-1">
                                <PlayerControls compact />
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
