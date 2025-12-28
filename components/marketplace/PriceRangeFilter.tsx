"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMusicStore } from "@/lib/music/musicStore";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export function PriceRangeFilter() {
    const { marketplaceFilters, setMarketplaceFilters } = useMusicStore();

    const [minPrice, setMinPrice] = useState(marketplaceFilters.minPrice ?? 0);
    const [maxPrice, setMaxPrice] = useState(marketplaceFilters.maxPrice ?? 100);

    // Debounce: Update store after 500ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setMarketplaceFilters({
                minPrice: minPrice > 0 ? minPrice : undefined,
                maxPrice: maxPrice < 100 ? maxPrice : undefined,
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [minPrice, maxPrice, setMarketplaceFilters]);

    const hasActiveFilter = (marketplaceFilters.minPrice ?? 0) > 0 || (marketplaceFilters.maxPrice ?? 100) < 100;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={hasActiveFilter ? "secondary" : "outline"} size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Price
                    {hasActiveFilter && ` (${minPrice}-${maxPrice} ꜩ)`}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <div>
                        <Label>Price Range (ꜩ)</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                placeholder="Min"
                                min={0}
                                max={maxPrice}
                                className="w-20"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                placeholder="Max"
                                min={minPrice}
                                className="w-20"
                            />
                        </div>
                    </div>

                    <div>
                        <Slider
                            value={[minPrice, maxPrice]}
                            onValueChange={([newMin, newMax]) => {
                                setMinPrice(newMin);
                                setMaxPrice(newMax);
                            }}
                            min={0}
                            max={100}
                            step={1}
                            className="mt-2"
                        />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setMinPrice(0); setMaxPrice(1); }}>
                            Under 1ꜩ
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setMinPrice(1); setMaxPrice(10); }}>
                            1-10ꜩ
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setMinPrice(10); setMaxPrice(50); }}>
                            10-50ꜩ
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setMinPrice(50); setMaxPrice(100); }}>
                            50+ꜩ
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => { setMinPrice(0); setMaxPrice(100); }}
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
