"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMusicStore } from "@/lib/music/musicStore";

export function useKeyboardShortcuts() {
    const router = useRouter();
    const {
        togglePlayPause,
        playNext,
        playPrevious,
        volume,
        setVolume,
        toggleMute,
        seek,
        currentTime,
        currentTrack,
        toggleFavorite,
        toggleRepeat,
        toggleShuffle,
    } = useMusicStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in input/textarea/contenteditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // Prevent default for shortcuts we handle
            const preventDefaults = [" ", "/", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
            if (preventDefaults.includes(e.key) && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
            }

            switch (e.key) {
                case " ":
                    togglePlayPause();
                    break;

                case "ArrowRight":
                    if (e.shiftKey) {
                        // Shift + Arrow Right: Seek forward 10 seconds
                        seek(currentTime + 10);
                    } else {
                        // Arrow Right: Next track
                        playNext();
                    }
                    break;

                case "ArrowLeft":
                    if (e.shiftKey) {
                        // Shift + Arrow Left: Seek backward 10 seconds
                        seek(Math.max(0, currentTime - 10));
                    } else {
                        // Arrow Left: Previous track
                        playPrevious();
                    }
                    break;

                case "ArrowUp":
                    // Arrow Up: Increase volume
                    setVolume(Math.min(1, volume + 0.05));
                    break;

                case "ArrowDown":
                    // Arrow Down: Decrease volume
                    setVolume(Math.max(0, volume - 0.05));
                    break;

                case "m":
                case "M":
                    // M: Toggle mute
                    toggleMute();
                    break;

                case "f":
                case "F":
                    // F: Toggle favorite for current track
                    if (currentTrack) {
                        toggleFavorite(currentTrack.id);
                    }
                    break;

                case "r":
                case "R":
                    // R: Toggle repeat mode
                    toggleRepeat();
                    break;

                case "s":
                case "S":
                    // S: Toggle shuffle
                    toggleShuffle();
                    break;

                case "/":
                    // /: Focus search bar
                    e.preventDefault();
                    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
                    if (searchInput) {
                        searchInput.focus();
                    }
                    break;

                case "?":
                    // ?: Show keyboard shortcuts help (future implementation)
                    break;

                // Navigation shortcuts (g + key)
                case "g":
                    // Set up a temporary listener for the next key
                    const handleNextKey = (nextEvent: KeyboardEvent) => {
                        switch (nextEvent.key) {
                            case "d":
                            case "D":
                                // g + d: Go to dashboard
                                router.push("/");
                                break;
                            case "l":
                            case "L":
                                // g + l: Go to library
                                router.push("/library");
                                break;
                        }
                        window.removeEventListener("keydown", handleNextKey);
                    };
                    window.addEventListener("keydown", handleNextKey);
                    // Remove listener after 1 second if no second key pressed
                    setTimeout(() => {
                        window.removeEventListener("keydown", handleNextKey);
                    }, 1000);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        togglePlayPause,
        playNext,
        playPrevious,
        volume,
        setVolume,
        toggleMute,
        seek,
        currentTime,
        currentTrack,
        toggleFavorite,
        toggleRepeat,
        toggleShuffle,
        router,
    ]);
}
