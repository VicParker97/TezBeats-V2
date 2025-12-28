"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import { Button } from "@/components/ui/button";

export function SearchBar() {
    const { searchQuery, setSearchQuery } = useMusicStore();

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, collections..."
                className="pl-10 pr-10"
                type="search"
            />
            {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                    title="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
