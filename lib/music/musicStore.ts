import { create } from "zustand";
import type WaveSurfer from "wavesurfer.js";
import type { MusicNFT, RepeatMode } from "./types/musicNFT";
import type { PlayHistoryEntry, TrackAnalytics } from "./types/analytics";
import { loadAnalyticsData, saveAnalyticsData, getEmptyAnalyticsData } from "./utils/localStorageUtils";
import type { ActiveFilters, SortBy, SortOrder } from "./utils/searchUtils";
import { searchTracks, filterTracks, sortTracks } from "./utils/searchUtils";

export interface ArtistStats {
    artist: string;
    trackCount: number;
    playCount: number;
    tracks: MusicNFT[];
}

interface MusicState {
    // Current Playback
    currentTrack: MusicNFT | null;
    isPlaying: boolean;
    volume: number; // 0-1
    isMuted: boolean;
    currentTime: number; // seconds
    duration: number; // seconds

    // Queue Management
    queue: MusicNFT[];
    queueIndex: number;
    repeatMode: RepeatMode;
    shuffleMode: boolean;
    originalQueue: MusicNFT[]; // For shuffle restoration

    // Music Library
    musicNFTs: MusicNFT[];
    isLoadingLibrary: boolean;
    libraryError: string | null;

    // Audio Instance (wavesurfer)
    audioInstance: WaveSurfer | null;

    // Analytics
    playHistory: PlayHistoryEntry[];
    trackAnalytics: Record<string, TrackAnalytics>;
    favorites: string[];

    // Search & Filter
    searchQuery: string;
    activeFilters: ActiveFilters;
    sortBy: SortBy;
    sortOrder: SortOrder;

    // Playback Actions
    setCurrentTrack: (track: MusicNFT) => void;
    play: () => void;
    pause: () => void;
    togglePlayPause: () => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    seek: (time: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;

    // Queue Actions
    addToQueue: (track: MusicNFT) => void;
    addMultipleToQueue: (tracks: MusicNFT[]) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    playNext: () => void;
    playPrevious: () => void;
    playTrackAtIndex: (index: number) => void;
    toggleRepeat: () => void;
    toggleShuffle: () => void;

    // Library Actions
    setMusicNFTs: (nfts: MusicNFT[]) => void;
    setIsLoadingLibrary: (isLoading: boolean) => void;
    setLibraryError: (error: string | null) => void;

    // Analytics Actions
    recordPlay: (trackId: string, duration?: number) => void;
    toggleFavorite: (trackId: string) => void;
    getRecentlyPlayed: (limit?: number) => MusicNFT[];
    getMostPlayedTracks: (limit?: number) => MusicNFT[];
    getTopArtists: (limit?: number) => ArtistStats[];
    getFavoriteTracks: () => MusicNFT[];
    loadAnalytics: (address: string) => void;
    saveAnalytics: (address: string) => void;
    clearAnalytics: () => void;

    // Search & Filter Actions
    setSearchQuery: (query: string) => void;
    setActiveFilters: (filters: Partial<ActiveFilters>) => void;
    setSortBy: (sortBy: SortBy) => void;
    setSortOrder: (sortOrder: SortOrder) => void;
    toggleFilter: (filterKey: keyof ActiveFilters, value?: string) => void;
    clearFilters: () => void;
    getFilteredNFTs: () => MusicNFT[];

    // Audio Instance Management
    setAudioInstance: (instance: WaveSurfer | null) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
    // Initial State
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    currentTime: 0,
    duration: 0,

    queue: [],
    queueIndex: -1,
    repeatMode: "off",
    shuffleMode: false,
    originalQueue: [],

    musicNFTs: [],
    isLoadingLibrary: false,
    libraryError: null,

    audioInstance: null,

    // Analytics Initial State
    playHistory: [],
    trackAnalytics: {},
    favorites: [],

    // Search & Filter Initial State
    searchQuery: "",
    activeFilters: {
        favorites: false,
        recentlyPlayed: false,
    },
    sortBy: "name",
    sortOrder: "asc",

    // Playback Actions
    setCurrentTrack: (track) => {
        set({ currentTrack: track });
    },

    play: () => {
        set({ isPlaying: true });
    },

    pause: () => {
        set({ isPlaying: false });
    },

    togglePlayPause: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying });
    },

    setVolume: (volume) => {
        const { audioInstance } = get();
        const clampedVolume = Math.max(0, Math.min(1, volume));
        if (audioInstance) {
            // HTML5 audio element
            if ('volume' in audioInstance) {
                (audioInstance as HTMLAudioElement).volume = clampedVolume;
            }
            // WaveSurfer
            else if ('setVolume' in audioInstance) {
                (audioInstance as any).setVolume(clampedVolume);
            }
        }
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
    },

    toggleMute: () => {
        const { isMuted, volume, audioInstance } = get();
        if (audioInstance) {
            const targetVolume = isMuted ? volume : 0;
            // HTML5 audio element
            if ('volume' in audioInstance) {
                (audioInstance as HTMLAudioElement).volume = targetVolume;
            }
            // WaveSurfer
            else if ('setVolume' in audioInstance) {
                (audioInstance as any).setVolume(targetVolume);
            }
            set({ isMuted: !isMuted });
        }
    },

    seek: (time) => {
        const { audioInstance } = get();
        if (audioInstance) {
            // HTML5 audio element
            if ('currentTime' in audioInstance) {
                (audioInstance as HTMLAudioElement).currentTime = time;
                set({ currentTime: time });
            }
            // WaveSurfer
            else if ('seekTo' in audioInstance) {
                const { duration } = get();
                if (duration > 0) {
                    const seekPosition = time / duration;
                    (audioInstance as any).seekTo(seekPosition);
                    set({ currentTime: time });
                }
            }
        }
    },

    setCurrentTime: (time) => set({ currentTime: time }),

    setDuration: (duration) => set({ duration }),

    // Queue Actions
    addToQueue: (track) => {
        const { queue } = get();
        set({ queue: [...queue, track] });
    },

    addMultipleToQueue: (tracks) => {
        const { queue } = get();
        set({ queue: [...queue, ...tracks] });
    },

    removeFromQueue: (index) => {
        const { queue, queueIndex } = get();
        const newQueue = [...queue];
        newQueue.splice(index, 1);

        // Adjust queueIndex if necessary
        let newQueueIndex = queueIndex;
        if (index < queueIndex) {
            newQueueIndex = queueIndex - 1;
        } else if (index === queueIndex) {
            // Current track removed, stop playback
            get().pause();
            set({ currentTrack: null });
            newQueueIndex = -1;
        }

        set({ queue: newQueue, queueIndex: newQueueIndex });
    },

    clearQueue: () => {
        get().pause();
        set({
            queue: [],
            queueIndex: -1,
            currentTrack: null,
            originalQueue: [],
            shuffleMode: false,
        });
    },

    playNext: () => {
        const { queue, queueIndex, repeatMode } = get();

        if (repeatMode === "one") {
            // Replay current track
            get().seek(0);
            get().play();
            return;
        }

        const nextIndex = queueIndex + 1;

        if (nextIndex < queue.length) {
            get().playTrackAtIndex(nextIndex);
        } else if (repeatMode === "all" && queue.length > 0) {
            // Loop to start
            get().playTrackAtIndex(0);
        } else {
            // End of queue
            get().pause();
        }
    },

    playPrevious: () => {
        const { queueIndex, currentTime } = get();

        // If more than 3 seconds into track, restart current track
        if (currentTime > 3) {
            get().seek(0);
        } else if (queueIndex > 0) {
            get().playTrackAtIndex(queueIndex - 1);
        } else {
            // At start of queue, restart current track
            get().seek(0);
        }
    },

    playTrackAtIndex: (index) => {
        const { queue } = get();
        if (index >= 0 && index < queue.length) {
            const track = queue[index];
            set({
                currentTrack: track,
                queueIndex: index,
                currentTime: 0,
            });
            // Play will be triggered when audio loads
        }
    },

    toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        set({ repeatMode: nextMode });
    },

    toggleShuffle: () => {
        const { shuffleMode, queue, queueIndex, currentTrack } = get();

        if (!shuffleMode) {
            // Enable shuffle
            const originalQueue = [...queue];
            const shuffled = [...queue];

            // Remove current track from shuffle pool if playing
            if (queueIndex >= 0 && queueIndex < shuffled.length) {
                const currentTrackInQueue = shuffled[queueIndex];
                shuffled.splice(queueIndex, 1);

                // Fisher-Yates shuffle
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                // Put current track at index 0
                shuffled.unshift(currentTrackInQueue);

                set({
                    queue: shuffled,
                    queueIndex: 0,
                    originalQueue,
                    shuffleMode: true,
                });
            } else {
                // No current track, just shuffle
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                set({
                    queue: shuffled,
                    originalQueue,
                    shuffleMode: true,
                });
            }
        } else {
            // Disable shuffle - restore original order
            const { originalQueue } = get();
            const newIndex = currentTrack
                ? originalQueue.findIndex((t) => t.id === currentTrack.id)
                : -1;

            set({
                queue: originalQueue,
                queueIndex: newIndex >= 0 ? newIndex : queueIndex,
                shuffleMode: false,
            });
        }
    },

    // Library Actions
    setMusicNFTs: (nfts) => set({ musicNFTs: nfts }),

    setIsLoadingLibrary: (isLoading) => set({ isLoadingLibrary: isLoading }),

    setLibraryError: (error) => set({ libraryError: error }),

    // Analytics Actions
    recordPlay: (trackId, duration = 0) => {
        const { playHistory, trackAnalytics } = get();
        const now = Date.now();

        // Create new play history entry
        const newEntry: PlayHistoryEntry = {
            trackId,
            timestamp: now,
            duration,
        };

        // Keep only last 50 entries
        const updatedHistory = [newEntry, ...playHistory].slice(0, 50);

        // Update track analytics
        const trackStats = trackAnalytics[trackId] || {
            playCount: 0,
            lastPlayed: now,
            totalListenTime: 0,
            firstPlayed: now,
        };

        const updatedAnalytics = {
            ...trackAnalytics,
            [trackId]: {
                ...trackStats,
                playCount: trackStats.playCount + 1,
                lastPlayed: now,
                totalListenTime: trackStats.totalListenTime + duration,
            },
        };

        set({
            playHistory: updatedHistory,
            trackAnalytics: updatedAnalytics,
        });
    },

    toggleFavorite: (trackId) => {
        const { favorites, playHistory, trackAnalytics } = get();
        const isFavorited = favorites.includes(trackId);

        const updatedFavorites = isFavorited
            ? favorites.filter((id) => id !== trackId)
            : [...favorites, trackId];

        set({ favorites: updatedFavorites });

        // Auto-save to localStorage (get address from localStorage key)
        // Find the analytics data key in localStorage to get the address
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    saveAnalyticsData(address, {
                        playHistory,
                        trackAnalytics,
                        favorites: updatedFavorites,
                        version: 1,
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to auto-save favorites:', error);
        }
    },

    getRecentlyPlayed: (limit = 10) => {
        const { playHistory, musicNFTs } = get();

        // Get unique track IDs from history (most recent first)
        const uniqueTrackIds = Array.from(
            new Set(playHistory.map((entry) => entry.trackId))
        ).slice(0, limit);

        // Map to full MusicNFT objects
        return uniqueTrackIds
            .map((id) => musicNFTs.find((nft) => nft.id === id))
            .filter((nft): nft is MusicNFT => nft !== undefined);
    },

    getMostPlayedTracks: (limit = 10) => {
        const { trackAnalytics, musicNFTs } = get();

        // Sort tracks by play count
        const sortedTracks = musicNFTs
            .map((nft) => ({
                nft,
                playCount: trackAnalytics[nft.id]?.playCount || 0,
            }))
            .filter((item) => item.playCount > 0)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, limit)
            .map((item) => item.nft);

        return sortedTracks;
    },

    getTopArtists: (limit = 6) => {
        const { musicNFTs, trackAnalytics } = get();

        // Group by artist
        const artistMap = new Map<string, ArtistStats>();

        musicNFTs.forEach((nft) => {
            const artist = nft.audioMetadata.artist || nft.creator;
            const existing = artistMap.get(artist) || {
                artist,
                trackCount: 0,
                playCount: 0,
                tracks: [],
            };

            existing.trackCount++;
            existing.tracks.push(nft);

            // Add play count if available
            if (trackAnalytics[nft.id]) {
                existing.playCount += trackAnalytics[nft.id].playCount;
            }

            artistMap.set(artist, existing);
        });

        // Sort by play count, then track count
        return Array.from(artistMap.values())
            .sort((a, b) => {
                if (b.playCount !== a.playCount) {
                    return b.playCount - a.playCount;
                }
                return b.trackCount - a.trackCount;
            })
            .slice(0, limit);
    },

    getFavoriteTracks: () => {
        const { favorites, musicNFTs } = get();
        return musicNFTs.filter((nft) => favorites.includes(nft.id));
    },

    loadAnalytics: (address) => {
        const data = loadAnalyticsData(address);
        if (data) {
            set({
                playHistory: data.playHistory,
                trackAnalytics: data.trackAnalytics,
                favorites: data.favorites,
            });
        } else {
            // Initialize with empty data
            const emptyData = getEmptyAnalyticsData();
            set({
                playHistory: emptyData.playHistory,
                trackAnalytics: emptyData.trackAnalytics,
                favorites: emptyData.favorites,
            });
        }
    },

    saveAnalytics: (address) => {
        const { playHistory, trackAnalytics, favorites } = get();
        saveAnalyticsData(address, {
            playHistory,
            trackAnalytics,
            favorites,
            version: 1,
        });
    },

    clearAnalytics: () => {
        set({
            playHistory: [],
            trackAnalytics: {},
            favorites: [],
        });
    },

    // Search & Filter Actions
    setSearchQuery: (query) => set({ searchQuery: query }),

    setActiveFilters: (filters) => {
        const { activeFilters } = get();
        set({ activeFilters: { ...activeFilters, ...filters } });
    },

    setSortBy: (sortBy) => set({ sortBy }),

    setSortOrder: (sortOrder) => set({ sortOrder }),

    toggleFilter: (filterKey, value) => {
        const { activeFilters } = get();

        if (filterKey === "favorites" || filterKey === "recentlyPlayed") {
            set({
                activeFilters: {
                    ...activeFilters,
                    [filterKey]: !activeFilters[filterKey],
                },
            });
        } else if (value !== undefined) {
            // For collection, artist, genre filters
            set({
                activeFilters: {
                    ...activeFilters,
                    [filterKey]: activeFilters[filterKey] === value ? undefined : value,
                },
            });
        }
    },

    clearFilters: () => {
        set({
            searchQuery: "",
            activeFilters: {
                favorites: false,
                recentlyPlayed: false,
            },
        });
    },

    getFilteredNFTs: () => {
        const {
            musicNFTs,
            searchQuery,
            activeFilters,
            sortBy,
            sortOrder,
            favorites,
            playHistory,
            trackAnalytics,
        } = get();

        // Apply search
        let filtered = searchTracks(musicNFTs, searchQuery);

        // Apply filters
        filtered = filterTracks(filtered, activeFilters, favorites, playHistory);

        // Apply sort
        filtered = sortTracks(filtered, sortBy, sortOrder, trackAnalytics);

        return filtered;
    },

    // Audio Instance Management
    setAudioInstance: (instance) => set({ audioInstance: instance }),
}));
