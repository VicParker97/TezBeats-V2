"use client";

import { useEffect, useRef, useState } from "react";
import { useMusicStore } from "@/lib/music/musicStore";
import { resolveAudioUri, IPFS_GATEWAYS } from "@/lib/music/utils/ipfsResolver";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WaveformPlayerProps {
    className?: string;
}

export function WaveformPlayer({ className }: WaveformPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
    const hasRecorded30Sec = useRef(false);

    const {
        currentTrack,
        setDuration,
        setCurrentTime,
        playNext,
        setAudioInstance,
        volume,
        isPlaying,
        recordPlay,
    } = useMusicStore();

    // Auto-retry with next gateway on error
    const tryNextGateway = () => {
        if (currentGatewayIndex < IPFS_GATEWAYS.length - 1) {
            setCurrentGatewayIndex((prev) => prev + 1);
            setLoadError(null);
        } else {
            setLoadError("All IPFS gateways failed. The audio file may be unavailable.");
            setIsPlaying(false);
        }
    };

    // Load audio when track or gateway changes
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.audioUri) {
            setCurrentGatewayIndex(0);
            setLoadError(null);
            return;
        }

        const audio = audioRef.current;
        setIsLoading(true);
        setLoadError(null);

        // Use resolveAudioUri with the current gateway index
        const audioUrl = resolveAudioUri(currentTrack.audioUri, currentGatewayIndex);

        audio.src = audioUrl;
        audio.load();

        // Event handlers
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
            setLoadError(null);

            // Auto-play if needed - get fresh isPlaying state
            const currentState = useMusicStore.getState();
            if (currentState.isPlaying) {
                audio.play().catch((err) => {
                    console.error("Failed to auto-play:", err);
                });
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            // Record play if track finished
            if (currentTrack?.id && !hasRecorded30Sec.current) {
                recordPlay(currentTrack.id, audio.currentTime);
            }
            playNext();
        };

        const handleError = (e: Event) => {
            console.error("Audio error:", e);
            setIsLoading(false);
            tryNextGateway();
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);
        audio.addEventListener("canplay", handleCanPlay);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("canplay", handleCanPlay);
        };
    }, [currentTrack?.id, currentGatewayIndex]);

    // Reset gateway index when track changes
    useEffect(() => {
        setCurrentGatewayIndex(0);
        setLoadError(null);
        hasRecorded30Sec.current = false; // Reset for new track
    }, [currentTrack?.id]);

    // Track play after 30 seconds (industry standard for "play" count)
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.id || !isPlaying) return;

        const audio = audioRef.current;

        const checkThreshold = () => {
            if (audio.currentTime >= 30 && !hasRecorded30Sec.current) {
                recordPlay(currentTrack.id, 30);
                hasRecorded30Sec.current = true;
            }
        };

        audio.addEventListener("timeupdate", checkThreshold);
        return () => audio.removeEventListener("timeupdate", checkThreshold);
    }, [currentTrack?.id, isPlaying, recordPlay]);

    // Handle play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.error("Play error:", err);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Handle volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Store audio element reference (for seek functionality)
    useEffect(() => {
        if (audioRef.current) {
            setAudioInstance(audioRef.current as any);
        }
        return () => setAudioInstance(null);
    }, [setAudioInstance]);

    return (
        <>
            {loadError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loadError}</AlertDescription>
                </Alert>
            )}

            {/* Hidden HTML5 audio element */}
            <audio ref={audioRef} preload="metadata" />
        </>
    );
}
