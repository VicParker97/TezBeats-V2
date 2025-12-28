import { create } from "zustand";
import type WaveSurfer from "wavesurfer.js";
import type { MusicNFT, RepeatMode } from "./types/musicNFT";
import type { PlayHistoryEntry, TrackAnalytics } from "./types/analytics";
import type { Playlist, QueueHistoryItem } from "./types/playlist";
import type {
    MarketplaceData,
    MarketplaceListing,
    MarketplaceFilters,
    MarketplaceSortBy,
} from "./types/marketplace";
import { fetchTokenMarketplaceData, fetchMarketplaceListings } from "./api/objktAPI";
import {
    loadAnalyticsData,
    saveAnalyticsData,
    getEmptyAnalyticsData,
    saveQueue,
    loadQueue,
    saveQueueHistory,
    loadQueueHistory
} from "./utils/localStorageUtils";
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

    // Playlists
    playlists: Playlist[];

    // Queue History
    queueHistory: QueueHistoryItem[];

    // Marketplace (Token-specific data)
    marketplaceDataCache: Map<string, MarketplaceData>; // Key: "{contract}:{tokenId}"
    isLoadingMarketplace: boolean;

    // Marketplace Discovery (Browse listings)
    marketplaceListings: MarketplaceListing[];
    isLoadingMarketplaceListings: boolean;
    marketplaceError: string | null;
    marketplaceTotalCount: number;
    marketplaceHasMore: boolean;
    marketplaceFilters: MarketplaceFilters;
    marketplaceSortBy: MarketplaceSortBy;
    marketplaceSearchQuery: string;
    marketplacePage: number;

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
    reorderQueue: (oldIndex: number, newIndex: number) => void;
    insertNext: (track: MusicNFT) => void; // Insert after current track
    insertMultipleNext: (tracks: MusicNFT[]) => void; // Insert multiple after current
    saveQueueToStorage: () => void;
    loadQueueFromStorage: () => void;

    // Queue History Actions
    saveQueueAsHistory: (name?: string) => void;
    loadQueueFromHistory: (historyId: string) => void;
    deleteQueueHistory: (historyId: string) => void;

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

    // Playlist Actions
    createPlaylist: (name: string, description?: string) => string; // Returns playlist ID
    deletePlaylist: (playlistId: string) => void;
    updatePlaylist: (playlistId: string, updates: Partial<Omit<Playlist, "id" | "createdAt">>) => void;
    addToPlaylist: (playlistId: string, trackId: string) => void;
    removeFromPlaylist: (playlistId: string, trackId: string) => void;
    addMultipleToPlaylist: (playlistId: string, trackIds: string[]) => void;
    reorderPlaylist: (playlistId: string, oldIndex: number, newIndex: number) => void;
    playPlaylist: (playlistId: string, options?: { startIndex?: number; append?: boolean; shuffle?: boolean }) => void;
    getPlaylist: (playlistId: string) => Playlist | undefined;
    getPlaylistTracks: (playlistId: string) => MusicNFT[];
    saveQueueAsPlaylist: (name?: string) => string | null; // Returns playlist ID or null if queue is empty

    // Marketplace Actions (Token-specific)
    fetchMarketplaceData: (nft: MusicNFT) => Promise<void>;
    clearMarketplaceCache: () => void;

    // Marketplace Discovery Actions
    fetchMarketplaceListings: (reset?: boolean) => Promise<void>;
    setMarketplaceFilters: (filters: Partial<MarketplaceFilters>) => void;
    setMarketplaceSortBy: (sortBy: MarketplaceSortBy) => void;
    setMarketplaceSearchQuery: (query: string) => void;
    loadMoreMarketplaceListings: () => Promise<void>;
    clearMarketplaceFilters: () => void;

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

    // Playlists Initial State
    playlists: [],

    // Queue History Initial State
    queueHistory: [],

    // Marketplace Initial State
    marketplaceDataCache: new Map(),
    isLoadingMarketplace: false,

    // Marketplace Discovery Initial State
    marketplaceListings: [],
    isLoadingMarketplaceListings: false,
    marketplaceError: null,
    marketplaceTotalCount: 0,
    marketplaceHasMore: false,
    marketplaceFilters: {},
    marketplaceSortBy: 'recent',
    marketplaceSearchQuery: '',
    marketplacePage: 0,

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
                (audioInstance as unknown as HTMLAudioElement).volume = clampedVolume;
            }
            // WaveSurfer
            else if ('setVolume' in audioInstance) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                (audioInstance as unknown as HTMLAudioElement).volume = targetVolume;
            }
            // WaveSurfer
            else if ('setVolume' in audioInstance) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                (audioInstance as unknown as HTMLAudioElement).currentTime = time;
                set({ currentTime: time });
            }
            // WaveSurfer
            else if ('seekTo' in audioInstance) {
                const { duration } = get();
                if (duration > 0) {
                    const seekPosition = time / duration;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        get().saveQueueToStorage();
    },

    addMultipleToQueue: (tracks) => {
        const { queue } = get();
        set({ queue: [...queue, ...tracks] });
        get().saveQueueToStorage();
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
        get().saveQueueToStorage();
    },

    clearQueue: () => {
        // Save current queue to history before clearing
        const { queue } = get();
        if (queue.length > 0) {
            get().saveQueueAsHistory();
        }

        get().pause();
        set({
            queue: [],
            queueIndex: -1,
            currentTrack: null,
            originalQueue: [],
            shuffleMode: false,
        });
        get().saveQueueToStorage();
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
            get().saveQueueToStorage();
            // Play will be triggered when audio loads
        }
    },

    toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        set({ repeatMode: nextMode });
        get().saveQueueToStorage();
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
        get().saveQueueToStorage();
    },

    reorderQueue: (oldIndex, newIndex) => {
        const { queue, queueIndex } = get();

        // Clone array
        const newQueue = [...queue];

        // Remove from old position
        const [movedTrack] = newQueue.splice(oldIndex, 1);

        // Insert at new position
        newQueue.splice(newIndex, 0, movedTrack);

        // Adjust currentIndex if needed
        let newQueueIndex = queueIndex;
        if (queueIndex === oldIndex) {
            newQueueIndex = newIndex;
        } else if (oldIndex < queueIndex && newIndex >= queueIndex) {
            newQueueIndex--;
        } else if (oldIndex > queueIndex && newIndex <= queueIndex) {
            newQueueIndex++;
        }

        set({ queue: newQueue, queueIndex: newQueueIndex });
        get().saveQueueToStorage();
    },

    insertNext: (track) => {
        const { queue, queueIndex } = get();

        // If queue is empty or no track playing, just add to queue
        if (queue.length === 0 || queueIndex === -1) {
            get().addToQueue(track);
            return;
        }

        // Check if track already in queue
        const existingIndex = queue.findIndex(t => t.id === track.id);
        if (existingIndex !== -1) {
            // Track exists - move it to play next position
            const newQueue = [...queue];
            const [movedTrack] = newQueue.splice(existingIndex, 1);
            newQueue.splice(queueIndex + 1, 0, movedTrack);

            // Adjust queueIndex if we removed track before current position
            const newQueueIndex = existingIndex < queueIndex ? queueIndex - 1 : queueIndex;
            set({ queue: newQueue, queueIndex: newQueueIndex });
        } else {
            // New track - insert after current
            const newQueue = [...queue];
            newQueue.splice(queueIndex + 1, 0, track);
            set({ queue: newQueue });
        }

        get().saveQueueToStorage();
    },

    insertMultipleNext: (tracks) => {
        const { queue, queueIndex } = get();

        if (queue.length === 0 || queueIndex === -1) {
            get().addMultipleToQueue(tracks);
            return;
        }

        // Insert all tracks after current position
        const newQueue = [...queue];
        newQueue.splice(queueIndex + 1, 0, ...tracks);

        set({ queue: newQueue });
        get().saveQueueToStorage();
    },

    // Queue Persistence
    saveQueueToStorage: () => {
        const { queue, queueIndex, repeatMode, shuffleMode, originalQueue } = get();

        // Get wallet address from localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    const queueData = {
                        tracks: queue,
                        currentIndex: queueIndex,
                        repeatMode,
                        shuffleMode,
                        originalQueue,
                        savedAt: Date.now()
                    };
                    saveQueue(address, queueData);
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to save queue:', error);
        }
    },

    loadQueueFromStorage: () => {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    const saved = loadQueue(address);
                    if (!saved) return;

                    set({
                        queue: saved.tracks,
                        queueIndex: saved.currentIndex,
                        repeatMode: saved.repeatMode,
                        shuffleMode: saved.shuffleMode,
                        originalQueue: saved.originalQueue || [],
                    });

                    // Restore current track if valid index
                    if (saved.currentIndex >= 0 && saved.tracks[saved.currentIndex]) {
                        set({ currentTrack: saved.tracks[saved.currentIndex] });
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to load queue:', error);
        }
    },

    // Queue History Actions
    saveQueueAsHistory: (name) => {
        const { queue, queueHistory } = get();

        if (queue.length === 0) return;

        const historyItem: QueueHistoryItem = {
            id: crypto.randomUUID(),
            name: name || `Queue from ${new Date().toLocaleDateString()}`,
            tracks: queue.map(t => t.id),
            playedAt: Date.now(),
            source: 'manual'
        };

        // Keep last 50 queue history items
        const newHistory = [historyItem, ...queueHistory].slice(0, 50);
        set({ queueHistory: newHistory });

        // Save to localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    saveQueueHistory(address, newHistory);
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to save queue history:', error);
        }
    },

    loadQueueFromHistory: (historyId) => {
        const { queueHistory, musicNFTs } = get();
        const historyItem = queueHistory.find(h => h.id === historyId);

        if (!historyItem) return;

        // Convert track IDs to MusicNFT objects
        const tracks = historyItem.tracks
            .map(id => musicNFTs.find(t => t.id === id))
            .filter(Boolean) as MusicNFT[];

        if (tracks.length > 0) {
            set({
                queue: tracks,
                queueIndex: 0,
                currentTrack: tracks[0],
                isPlaying: false
            });
            get().saveQueueToStorage();
        }
    },

    deleteQueueHistory: (historyId) => {
        const { queueHistory } = get();
        const newHistory = queueHistory.filter(h => h.id !== historyId);
        set({ queueHistory: newHistory });

        // Save to localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    saveQueueHistory(address, newHistory);
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to delete queue history:', error);
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
                    const { playlists } = get();
                    saveAnalyticsData(address, {
                        playHistory,
                        trackAnalytics,
                        favorites: updatedFavorites,
                        playlists,
                        version: 2,
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
                playlists: data.playlists,
                queueHistory: data.queueHistory || [],
            });

            // Load queue state if available
            if (data.queue && data.queue.tracks.length > 0) {
                set({
                    queue: data.queue.tracks,
                    queueIndex: data.queue.currentIndex,
                    repeatMode: data.queue.repeatMode,
                    shuffleMode: data.queue.shuffleMode,
                    originalQueue: data.queue.originalQueue || [],
                });

                // Restore current track if valid index
                if (data.queue.currentIndex >= 0 && data.queue.tracks[data.queue.currentIndex]) {
                    set({ currentTrack: data.queue.tracks[data.queue.currentIndex] });
                }
            }
        } else {
            // Initialize with empty data
            const emptyData = getEmptyAnalyticsData();
            set({
                playHistory: emptyData.playHistory,
                trackAnalytics: emptyData.trackAnalytics,
                favorites: emptyData.favorites,
                playlists: emptyData.playlists,
                queueHistory: emptyData.queueHistory || [],
            });
        }
    },

    saveAnalytics: (address) => {
        const { playHistory, trackAnalytics, favorites, playlists, queue, queueIndex, repeatMode, shuffleMode, originalQueue, queueHistory } = get();
        saveAnalyticsData(address, {
            playHistory,
            trackAnalytics,
            favorites,
            playlists,
            queue: {
                tracks: queue,
                currentIndex: queueIndex,
                repeatMode,
                shuffleMode,
                originalQueue,
                savedAt: Date.now()
            },
            queueHistory,
            version: 3,
        });
    },

    clearAnalytics: () => {
        set({
            playHistory: [],
            trackAnalytics: {},
            favorites: [],
            playlists: [],
            queueHistory: [],
        });
    },

    // Playlist Actions
    createPlaylist: (name, description) => {
        const { playlists } = get();
        const now = Date.now();
        const newPlaylist: Playlist = {
            id: crypto.randomUUID(),
            name,
            description,
            trackIds: [],
            createdAt: now,
            updatedAt: now,
        };

        set({ playlists: [...playlists, newPlaylist] });
        return newPlaylist.id;
    },

    deletePlaylist: (playlistId) => {
        const { playlists } = get();
        set({ playlists: playlists.filter((p) => p.id !== playlistId) });
    },

    updatePlaylist: (playlistId, updates) => {
        const { playlists } = get();
        set({
            playlists: playlists.map((p) =>
                p.id === playlistId
                    ? { ...p, ...updates, updatedAt: Date.now() }
                    : p
            ),
        });
    },

    addToPlaylist: (playlistId, trackId) => {
        const { playlists } = get();
        set({
            playlists: playlists.map((p) =>
                p.id === playlistId && !p.trackIds.includes(trackId)
                    ? {
                          ...p,
                          trackIds: [...p.trackIds, trackId],
                          updatedAt: Date.now(),
                      }
                    : p
            ),
        });
    },

    removeFromPlaylist: (playlistId, trackId) => {
        const { playlists } = get();
        set({
            playlists: playlists.map((p) =>
                p.id === playlistId
                    ? {
                          ...p,
                          trackIds: p.trackIds.filter((id) => id !== trackId),
                          updatedAt: Date.now(),
                      }
                    : p
            ),
        });
    },

    addMultipleToPlaylist: (playlistId, trackIds) => {
        const { playlists } = get();
        set({
            playlists: playlists.map((p) =>
                p.id === playlistId
                    ? {
                          ...p,
                          trackIds: [
                              ...p.trackIds,
                              ...trackIds.filter((id) => !p.trackIds.includes(id)),
                          ],
                          updatedAt: Date.now(),
                      }
                    : p
            ),
        });
    },

    playPlaylist: (playlistId, options = {}) => {
        const { playlists, musicNFTs, queue, queueIndex } = get();
        const { startIndex = 0, append = false, shuffle = false } = options;
        const playlist = playlists.find((p) => p.id === playlistId);

        if (!playlist || playlist.trackIds.length === 0) return;

        // Get tracks in playlist order
        let playlistTracks = playlist.trackIds
            .map((id) => musicNFTs.find((nft) => nft.id === id))
            .filter((nft): nft is MusicNFT => nft !== undefined);

        if (playlistTracks.length === 0) return;

        // Shuffle if requested
        if (shuffle) {
            playlistTracks = playlistTracks.sort(() => Math.random() - 0.5);
        }

        if (append) {
            // Append to existing queue
            const newQueue = [...queue, ...playlistTracks];
            set({ queue: newQueue });

            // If nothing playing, start first added track
            if (queueIndex === -1 || !get().currentTrack) {
                set({
                    queueIndex: queue.length, // First new track
                    currentTrack: playlistTracks[0],
                });
                setTimeout(() => {
                    get().play();
                }, 100);
            }
        } else {
            // Replace queue (existing behavior)
            set({ queue: playlistTracks, queueIndex: startIndex });

            // Play the track at start index
            if (playlistTracks[startIndex]) {
                set({ currentTrack: playlistTracks[startIndex] });
                setTimeout(() => {
                    get().play();
                }, 100);
            }
        }

        // Save queue state
        get().saveQueueToStorage();
    },

    reorderPlaylist: (playlistId, oldIndex, newIndex) => {
        const { playlists } = get();
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const newTrackIds = [...playlist.trackIds];
        const [movedId] = newTrackIds.splice(oldIndex, 1);
        newTrackIds.splice(newIndex, 0, movedId);

        const updatedPlaylists = playlists.map(p =>
            p.id === playlistId
                ? { ...p, trackIds: newTrackIds, updatedAt: Date.now() }
                : p
        );

        set({ playlists: updatedPlaylists });

        // Persist to localStorage
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('tezbeat_analytics_')) {
                    const address = key.replace('tezbeat_analytics_', '');
                    get().saveAnalytics(address);
                    break;
                }
            }
        } catch (error) {
            console.error('Failed to save playlist reorder:', error);
        }
    },

    getPlaylist: (playlistId) => {
        const { playlists } = get();
        return playlists.find((p) => p.id === playlistId);
    },

    getPlaylistTracks: (playlistId) => {
        const { playlists, musicNFTs } = get();
        const playlist = playlists.find((p) => p.id === playlistId);

        if (!playlist) return [];

        return playlist.trackIds
            .map((id) => musicNFTs.find((nft) => nft.id === id))
            .filter((nft): nft is MusicNFT => nft !== undefined);
    },

    saveQueueAsPlaylist: (name) => {
        const { queue } = get();

        if (queue.length === 0) return null;

        const playlistName = name || `Queue from ${new Date().toLocaleDateString()}`;
        const playlistId = get().createPlaylist(playlistName, `Saved from queue with ${queue.length} tracks`);

        // Add all queue tracks to playlist
        const trackIds = queue.map(t => t.id);
        get().addMultipleToPlaylist(playlistId, trackIds);

        return playlistId;
    },

    // Marketplace Actions
    fetchMarketplaceData: async (nft) => {
        const { marketplaceDataCache } = get();
        const cacheKey = `${nft.contract}:${nft.tokenId}`;

        // Check cache first
        if (marketplaceDataCache.has(cacheKey)) {
            return;
        }

        set({ isLoadingMarketplace: true });

        try {
            const data = await fetchTokenMarketplaceData(nft.contract, nft.tokenId);
            const newCache = new Map(marketplaceDataCache);
            newCache.set(cacheKey, data);
            set({ marketplaceDataCache: newCache });
        } catch (error) {
            console.error("Failed to fetch marketplace data:", error);
        } finally {
            set({ isLoadingMarketplace: false });
        }
    },

    clearMarketplaceCache: () => {
        set({ marketplaceDataCache: new Map() });
    },

    // Marketplace Discovery Actions
    fetchMarketplaceListings: async (reset = false) => {
        set({
            isLoadingMarketplaceListings: true,
            marketplaceError: null,
        });

        try {
            const { marketplaceFilters, marketplaceSortBy, marketplacePage } = get();
            const page = reset ? 0 : marketplacePage;
            const limit = 24;
            const offset = page * limit;

            const response = await fetchMarketplaceListings(
                limit,
                offset,
                marketplaceFilters,
                marketplaceSortBy
            );

            set({
                marketplaceListings: reset
                    ? response.listings
                    : [...get().marketplaceListings, ...response.listings],
                marketplaceTotalCount: response.total,
                marketplaceHasMore: response.hasMore,
                marketplacePage: page,
                isLoadingMarketplaceListings: false,
            });
        } catch (error) {
            console.error("Failed to fetch marketplace listings:", error);
            set({
                marketplaceError: error instanceof Error ? error.message : "Failed to load listings",
                isLoadingMarketplaceListings: false,
            });
        }
    },

    setMarketplaceFilters: (filters) => {
        const { marketplaceFilters } = get();
        set({
            marketplaceFilters: { ...marketplaceFilters, ...filters },
            marketplacePage: 0,
        });
        // Fetch with new filters
        get().fetchMarketplaceListings(true);
    },

    setMarketplaceSortBy: (sortBy) => {
        set({
            marketplaceSortBy: sortBy,
            marketplacePage: 0,
        });
        // Fetch with new sort
        get().fetchMarketplaceListings(true);
    },

    setMarketplaceSearchQuery: (query) => {
        set({
            marketplaceSearchQuery: query,
            marketplacePage: 0,
        });
        // TODO: Implement search filtering (can be done client-side or add to API)
    },

    loadMoreMarketplaceListings: async () => {
        const { marketplaceHasMore, isLoadingMarketplaceListings, marketplacePage } = get();

        if (!marketplaceHasMore || isLoadingMarketplaceListings) {
            return;
        }

        const nextPage = marketplacePage + 1;
        set({ marketplacePage: nextPage });
        await get().fetchMarketplaceListings(false);
    },

    clearMarketplaceFilters: () => {
        set({
            marketplaceFilters: {},
            marketplaceSortBy: 'recent',
            marketplaceSearchQuery: '',
            marketplacePage: 0,
        });
        // Fetch with cleared filters
        get().fetchMarketplaceListings(true);
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
