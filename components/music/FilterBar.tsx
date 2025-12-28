"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, X } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUniqueCollections, getUniqueArtists, getUniqueGenres } from "@/lib/music/utils/searchUtils";

export function FilterBar() {
    const { musicNFTs, activeFilters, toggleFilter, clearFilters } = useMusicStore();

    const collections = getUniqueCollections(musicNFTs);
    const artists = getUniqueArtists(musicNFTs);
    const genres = getUniqueGenres(musicNFTs);

    const hasActiveFilters =
        activeFilters.favorites ||
        activeFilters.recentlyPlayed ||
        activeFilters.collection ||
        activeFilters.artist ||
        activeFilters.genre;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filters */}
            <Button
                variant={activeFilters.favorites ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("favorites")}
                className="h-8"
            >
                <Heart className={`h-3.5 w-3.5 mr-1.5 ${activeFilters.favorites ? "fill-current" : ""}`} />
                Favorites
            </Button>

            <Button
                variant={activeFilters.recentlyPlayed ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("recentlyPlayed")}
                className="h-8"
            >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Recently Played
            </Button>

            {/* Collection Filter */}
            {collections.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={activeFilters.collection ? "default" : "outline"} size="sm" className="h-8">
                            Collection
                            {activeFilters.collection && (
                                <Badge variant="secondary" className="ml-1.5 h-4 px-1">
                                    1
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>Filter by Collection</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {collections.map((collection) => (
                            <DropdownMenuItem
                                key={collection}
                                onClick={() => toggleFilter("collection", collection)}
                                className={activeFilters.collection === collection ? "bg-accent" : ""}
                            >
                                {collection}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Artist Filter */}
            {artists.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={activeFilters.artist ? "default" : "outline"} size="sm" className="h-8">
                            Artist
                            {activeFilters.artist && (
                                <Badge variant="secondary" className="ml-1.5 h-4 px-1">
                                    1
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>Filter by Artist</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {artists.map((artist) => (
                            <DropdownMenuItem
                                key={artist}
                                onClick={() => toggleFilter("artist", artist)}
                                className={activeFilters.artist === artist ? "bg-accent" : ""}
                            >
                                {artist}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Genre Filter */}
            {genres.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={activeFilters.genre ? "default" : "outline"} size="sm" className="h-8">
                            Genre
                            {activeFilters.genre && (
                                <Badge variant="secondary" className="ml-1.5 h-4 px-1">
                                    1
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {genres.map((genre) => (
                            <DropdownMenuItem
                                key={genre}
                                onClick={() => toggleFilter("genre", genre)}
                                className={activeFilters.genre === genre ? "bg-accent" : ""}
                            >
                                {genre}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
