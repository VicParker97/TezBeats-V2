"use client";

import { useEffect } from "react";
import { useMusicStore } from "@/lib/music/musicStore";
import { fetchMusicNFTs } from "@/lib/music/api/fetchMusicNFTs";
import { MusicNFTCard } from "./MusicNFTCard";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { SortDropdown } from "./SortDropdown";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, Music, RefreshCw } from "lucide-react";

interface MusicLibraryProps {
    address: string | null;
}

export function MusicLibrary({ address }: MusicLibraryProps) {
    const {
        musicNFTs,
        isLoadingLibrary,
        libraryError,
        setMusicNFTs,
        setIsLoadingLibrary,
        setLibraryError,
        addMultipleToQueue,
        getFilteredNFTs,
    } = useMusicStore();

    // Get filtered NFTs based on search, filters, and sort
    const filteredNFTs = getFilteredNFTs();

    // Fetch music NFTs when address changes
    useEffect(() => {
        if (!address) {
            setMusicNFTs([]);
            setLibraryError(null);
            return;
        }

        const loadMusicNFTs = async () => {
            setIsLoadingLibrary(true);
            setLibraryError(null);

            try {
                const nfts = await fetchMusicNFTs(address);
                setMusicNFTs(nfts);
            } catch (error) {
                console.error("Failed to fetch music NFTs:", error);
                setLibraryError("Failed to load music NFTs. Please try again.");
            } finally {
                setIsLoadingLibrary(false);
            }
        };

        loadMusicNFTs();
    }, [address]);

    // Handle refresh
    const handleRefresh = async () => {
        if (!address) return;

        setIsLoadingLibrary(true);
        setLibraryError(null);

        try {
            const nfts = await fetchMusicNFTs(address);
            setMusicNFTs(nfts);
        } catch (error) {
            console.error("Failed to fetch music NFTs:", error);
            setLibraryError("Failed to load music NFTs. Please try again.");
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    // Handle play all
    const handlePlayAll = () => {
        if (musicNFTs.length > 0) {
            addMultipleToQueue(musicNFTs);
            // Play first track
            const firstTrack = musicNFTs[0];
            useMusicStore.setState({
                currentTrack: firstTrack,
                queueIndex: 0,
            });
        }
    };

    // Loading state
    if (isLoadingLibrary) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading your music NFTs...</span>
                </div>

                {/* Skeleton cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (libraryError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    <span>{libraryError}</span>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    // Empty state
    if (musicNFTs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md">
                <Music className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Music NFTs Found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    {address
                        ? "Your wallet doesn't contain any music NFTs on Tezos mainnet."
                        : "Connect your wallet to discover your music NFT collection."}
                </p>
                {address && (
                    <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                )}
            </div>
        );
    }

    // Display music NFTs
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar />

            {/* Filter Bar and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <FilterBar />
                <SortDropdown />
            </div>

            {/* Results Header with controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Your Music Collection</h2>
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredNFTs.length} of {musicNFTs.length} track
                        {musicNFTs.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingLibrary}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLibrary ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={handlePlayAll} disabled={filteredNFTs.length === 0}>
                        <Music className="h-4 w-4 mr-2" />
                        Play All
                    </Button>
                </div>
            </div>

            {/* No Results State */}
            {filteredNFTs.length === 0 && musicNFTs.length > 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md">
                    <Music className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No tracks found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}

            {/* Grid of music NFT cards */}
            {filteredNFTs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredNFTs.map((nft) => (
                        <MusicNFTCard key={nft.id} nft={nft} />
                    ))}
                </div>
            )}
        </div>
    );
}
