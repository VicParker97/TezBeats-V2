"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import type { MarketplaceSortBy } from "@/lib/music/types/marketplace";

export function SortDropdown() {
    const { marketplaceSortBy, setMarketplaceSortBy } = useMusicStore();

    const sortOptions: { value: MarketplaceSortBy; label: string }[] = [
        { value: "recent", label: "Recently Listed" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "trending", label: "Trending" },
    ];

    return (
        <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select
                value={marketplaceSortBy}
                onValueChange={(value) => setMarketplaceSortBy(value as MarketplaceSortBy)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
