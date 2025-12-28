"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Repeat1,
    Shuffle,
    Trash2,
} from "lucide-react";

interface PlayerControlsProps {
    className?: string;
    compact?: boolean;
}

export function PlayerControls({ className, compact = false }: PlayerControlsProps) {
    const {
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        repeatMode,
        shuffleMode,
        togglePlayPause,
        setVolume,
        toggleMute,
        seek,
        playNext,
        playPrevious,
        toggleRepeat,
        toggleShuffle,
        currentTrack,
        clearQueue,
        queue,
    } = useMusicStore();

    // Format time (seconds) to MM:SS
    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
    };

    // Handle seek
    const handleSeekChange = (value: number[]) => {
        seek(value[0]);
    };

    // Handle clear queue
    const handleClearQueue = () => {
        if (queue.length > 0 && confirm("Clear entire queue?")) {
            clearQueue();
        }
    };

    const hasTrack = !!currentTrack;

    if (compact) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {/* Previous */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    disabled={!hasTrack}
                    title="Previous"
                    className="h-7 w-7"
                >
                    <SkipBack className="h-3.5 w-3.5" />
                </Button>

                {/* Play/Pause */}
                <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={togglePlayPause}
                    disabled={!hasTrack}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="h-4 w-4" />
                    ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                    )}
                </Button>

                {/* Next */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    disabled={!hasTrack}
                    title="Next"
                    className="h-7 w-7"
                >
                    <SkipForward className="h-3.5 w-3.5" />
                </Button>

                {/* Progress Bar */}
                <span className="text-[10px] text-muted-foreground w-9 text-right tabular-nums">
                    {formatTime(currentTime)}
                </span>
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeekChange}
                    disabled={!hasTrack || duration === 0}
                    className="flex-1"
                />
                <span className="text-[10px] text-muted-foreground w-9 tabular-nums">
                    {formatTime(duration)}
                </span>

                {/* Volume */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    disabled={!hasTrack}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="h-6 w-6"
                >
                    {isMuted || volume === 0 ? (
                        <VolumeX className="h-3 w-3" />
                    ) : (
                        <Volume2 className="h-3 w-3" />
                    )}
                </Button>
                <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    disabled={!hasTrack}
                    className="w-16"
                />
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center space-y-3 ${className}`}>
            {/* Main Playback Controls - Centered */}
            <div className="flex items-center gap-3">
                {/* Shuffle */}
                <Button
                    variant={shuffleMode ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleShuffle}
                    disabled={!hasTrack}
                    title="Shuffle"
                    className="h-9 w-9"
                >
                    <Shuffle className="h-4 w-4" />
                </Button>

                {/* Previous */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    disabled={!hasTrack}
                    title="Previous"
                    className="h-10 w-10"
                >
                    <SkipBack className="h-5 w-5" />
                </Button>

                {/* Play/Pause - Large centered button */}
                <Button
                    variant="default"
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                    onClick={togglePlayPause}
                    disabled={!hasTrack}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="h-7 w-7" />
                    ) : (
                        <Play className="h-7 w-7 ml-0.5" />
                    )}
                </Button>

                {/* Next */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    disabled={!hasTrack}
                    title="Next"
                    className="h-10 w-10"
                >
                    <SkipForward className="h-5 w-5" />
                </Button>

                {/* Repeat */}
                <Button
                    variant={repeatMode !== "off" ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleRepeat}
                    disabled={!hasTrack}
                    title={`Repeat: ${repeatMode}`}
                    className="h-9 w-9"
                >
                    {repeatMode === "one" ? (
                        <Repeat1 className="h-4 w-4" />
                    ) : (
                        <Repeat className="h-4 w-4" />
                    )}
                </Button>

                {/* Clear Queue */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearQueue}
                    disabled={queue.length === 0}
                    title="Clear queue"
                    className="h-9 w-9"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Progress Bar - Full width */}
            <div className="w-full flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                    {formatTime(currentTime)}
                </span>
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeekChange}
                    disabled={!hasTrack || duration === 0}
                    className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 tabular-nums">
                    {formatTime(duration)}
                </span>

                {/* Volume Control - Inline */}
                <div className="flex items-center gap-2 ml-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        disabled={!hasTrack}
                        title={isMuted ? "Unmute" : "Mute"}
                        className="h-8 w-8"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        disabled={!hasTrack}
                        className="w-24"
                    />
                    <span className="text-xs text-muted-foreground w-8 tabular-nums">
                        {Math.round((isMuted ? 0 : volume) * 100)}
                    </span>
                </div>
            </div>
        </div>
    );
}
