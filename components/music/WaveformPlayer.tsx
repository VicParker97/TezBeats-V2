"use client";

import { useEffect, useRef, useState } from "react";
import { useMusicStore } from "@/lib/music/musicStore";
import { resolveAudioUri } from "@/lib/music/utils/ipfsResolver";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function WaveformPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [currentGatewayIndex] = useState(0);
    const hasRecorded30Sec = useRef(false);
    const currentTrackId = useRef<string | null>(null);

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

    // Auto-retry with next gateway on error (disabled - single gateway mode)
    const tryNextGateway = () => {
        setLoadError("The audio file may be unavailable.");
        useMusicStore.setState({ isPlaying: false });
    };

    // Load audio when track changes
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.audioUri) {
            setLoadError(null);
            currentTrackId.current = null;
            return;
        }

        // Only reload if track actually changed
        if (currentTrackId.current === currentTrack.id) {
            return;
        }

        const audio = audioRef.current;
        setLoadError(null);
        currentTrackId.current = currentTrack.id;

        // Use resolveAudioUri
        const audioUrl = resolveAudioUri(currentTrack.audioUri);

        audio.src = audioUrl;
        audio.load();

        // Event handlers
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
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
            tryNextGateway();
        };

        const handleCanPlay = () => {
            setLoadError(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTrack?.id, currentGatewayIndex]);

    // Reset when track changes
    useEffect(() => {
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
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    // Ignore AbortError - happens during track changes
                    if (err.name !== 'AbortError') {
                        console.error("Play error:", err);
                    }
                });
            }
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
