"use client";

import { Button } from "@/components/ui/button";
import { useMusicStore } from "@/lib/music/musicStore";
import type { EditionType } from "@/lib/music/types/marketplace";
import { Infinity, Award, Layers } from "lucide-react";

export function EditionTypeFilter() {
    const { marketplaceFilters, setMarketplaceFilters } = useMusicStore();
    const currentType = marketplaceFilters.editionType ?? 'all';

    const editionTypes: Array<{
        value: EditionType | 'all';
        label: string;
        icon: typeof Infinity;
    }> = [
        { value: 'all', label: 'All', icon: Layers },
        { value: '1/1', label: '1/1', icon: Award },
        { value: 'limited', label: 'Limited', icon: Layers },
        { value: 'open', label: 'Open', icon: Infinity },
    ];

    return (
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
            {editionTypes.map((type) => {
                const Icon = type.icon;
                const isActive = currentType === type.value;

                return (
                    <Button
                        key={type.value}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setMarketplaceFilters({ editionType: type.value })}
                        className="gap-1"
                    >
                        <Icon className="h-3 w-3" />
                        {type.label}
                    </Button>
                );
            })}
        </div>
    );
}
