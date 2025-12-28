"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
    return (
        <DashboardLayout>
            {/* Header with ShoppingBag icon */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Marketplace</h1>
                            <p className="text-sm text-muted-foreground">
                                Discover and collect music NFTs
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-6 pb-24">
                    <MarketplaceContent />
                </div>
            </div>
        </DashboardLayout>
    );
}
