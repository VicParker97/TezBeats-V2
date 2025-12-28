"use client";

import { useTezos } from "@/lib/tezos/useTezos";
import { MusicLibrary } from "@/components/music/MusicLibrary";
import { Playlist } from "@/components/music/Playlist";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Music } from "lucide-react";

export default function MusicPage() {
    const { address, network } = useTezos();
    const isConnected = !!address;
    const isMainnet = network === "mainnet";

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Music Player</h1>
                                <p className="text-sm text-muted-foreground">Your Tezos Music NFT Collection</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                            <Music className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                        <p className="text-muted-foreground mb-6">
                            Connect your Tezos wallet to discover and play your music NFT collection from mainnet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Click the "Connect Wallet" button in the header to get started
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pb-32">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Music Player</h1>
                                <p className="text-sm text-muted-foreground">Your Tezos Music NFT Collection</p>
                            </div>
                        </div>
                    </div>

                    {/* Mainnet warning */}
                    {!isMainnet && (
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You are connected to <strong>{network}</strong>. Switch to mainnet to see your music collection.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Music Library - Takes up more space */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <MusicLibrary address={address} />
                    </div>

                    {/* Playlist Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="lg:sticky lg:top-24">
                            <Playlist />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Music Player at bottom */}
            <MusicPlayer />
        </div>
    );
}
