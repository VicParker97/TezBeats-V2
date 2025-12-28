"use client";

import { useTezos } from "@/lib/tezos/useTezos";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MusicLibrary } from "@/components/music/MusicLibrary";
import { Library, Music } from "lucide-react";

export default function LibraryPage() {
    const { address } = useTezos();

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Library className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Music Library</h1>
                            <p className="text-sm text-muted-foreground">Browse your complete NFT music collection</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-6 pb-24">
                    <MusicLibrary address={address || ""} />
                </div>
            </div>
        </DashboardLayout>
    );
}
