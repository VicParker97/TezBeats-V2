"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import type { SortBy } from "@/lib/music/utils/searchUtils";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "artist", label: "Artist" },
    { value: "recent", label: "Recently Played" },
    { value: "playCount", label: "Play Count" },
    { value: "dateAdded", label: "Date Added" },
];

export function SortDropdown() {
    const { sortBy, sortOrder, setSortBy, setSortOrder } = useMusicStore();

    const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Name";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                    Sort: {currentSortLabel}
                    {sortOrder === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 ml-1.5" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5 ml-1.5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={sortBy === option.value ? "bg-accent" : ""}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setSortOrder("asc")}
                    className={sortOrder === "asc" ? "bg-accent" : ""}
                >
                    <ArrowUp className="h-3.5 w-3.5 mr-2" />
                    Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setSortOrder("desc")}
                    className={sortOrder === "desc" ? "bg-accent" : ""}
                >
                    <ArrowDown className="h-3.5 w-3.5 mr-2" />
                    Descending
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
