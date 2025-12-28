"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/lib/music/musicStore";
import { Shuffle, Repeat, Repeat1, Trash2, Music, X } from "lucide-react";
import Image from "next/image";

export function Playlist() {
    const {
        queue,
        queueIndex,
        repeatMode,
        shuffleMode,
        toggleRepeat,
        toggleShuffle,
        clearQueue,
        removeFromQueue,
        playTrackAtIndex,
    } = useMusicStore();

    // Handle clear queue with confirmation
    const handleClearQueue = () => {
        if (queue.length > 0 && confirm("Clear entire queue?")) {
            clearQueue();
        }
    };

    const getRepeatLabel = () => {
        switch (repeatMode) {
            case "one":
                return "Repeat: One";
            case "all":
                return "Repeat: All";
            default:
                return "Repeat: Off";
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Queue Controls */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {queue.length} track{queue.length !== 1 ? "s" : ""}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClearQueue}
                        disabled={queue.length === 0}
                        title="Clear queue"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={shuffleMode ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={toggleShuffle}
                        disabled={queue.length === 0}
                    >
                        <Shuffle className="h-3 w-3 mr-2" />
                        Shuffle
                    </Button>

                    <Button
                        variant={repeatMode !== "off" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={toggleRepeat}
                        disabled={queue.length === 0}
                        title={getRepeatLabel()}
                    >
                        {repeatMode === "one" ? (
                            <Repeat1 className="h-3 w-3 mr-2" />
                        ) : (
                            <Repeat className="h-3 w-3 mr-2" />
                        )}
                        {getRepeatLabel().split(": ")[1]}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {queue.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Music className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">Your queue is empty</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click on any track to start playing
                        </p>
                    </div>
                ) : (
                    // Queue list
                    <ScrollArea className="h-full">
                        <div className="space-y-1 p-4">
                            {queue.map((track, index) => {
                                const isPlaying = index === queueIndex;
                                const artist = track.audioMetadata.artist || track.creator;

                                return (
                                    <div
                                        key={`${track.id}-${index}`}
                                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                                            isPlaying ? "bg-muted border-l-2 border-primary" : ""
                                        }`}
                                        onClick={() => playTrackAtIndex(index)}
                                    >
                                        {/* Track number or playing indicator */}
                                        <div className="w-6 text-xs text-muted-foreground text-center">
                                            {isPlaying ? "▶" : index + 1}
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                                            <Image
                                                src={track.image}
                                                alt={track.name}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                }}
                                            />
                                        </div>

                                        {/* Track info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isPlaying ? "font-semibold" : ""}`}>
                                                {track.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{artist}</p>
                                        </div>

                                        {/* Remove button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromQueue(index);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
