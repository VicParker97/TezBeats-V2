"use client";

import { useEffect, useState } from "react";
import { useTezos } from "@/lib/tezos/useTezos";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Music, Play } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import { WalletInfoWidget } from "@/components/dashboard/WalletInfoWidget";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentlyPlayed } from "@/components/dashboard/RecentlyPlayed";
import { RandomDiscovery } from "@/components/dashboard/RandomDiscovery";
import { FavoriteTracks } from "@/components/dashboard/FavoriteTracks";
import { TopArtists } from "@/components/dashboard/TopArtists";

export default function Home() {
    const { address, network } = useTezos();
    const { musicNFTs, loadAnalytics, trackAnalytics } = useMusicStore();
    const isConnected = !!address;
    const [showConnectPrompt, setShowConnectPrompt] = useState(false);

    // Calculate total plays for StatCard
    const totalPlays = Object.values(trackAnalytics).reduce(
        (sum, stats) => sum + stats.playCount,
        0
    );

    // Load analytics when wallet connects
    useEffect(() => {
        if (address) {
            loadAnalytics(address);
        }
    }, [address, loadAnalytics]);

    // Save analytics on beforeunload
    useEffect(() => {
        if (!address) return;

        const handleBeforeUnload = () => {
            const state = useMusicStore.getState();
            state.saveAnalytics(address);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [address]);

    // Handle wallet connection from landing page
    const handleConnectWallet = () => {
        setShowConnectPrompt(true);
    };

    // Show landing page if not connected
    if (!isConnected) {
        return (
            <>
                <LandingPage onConnectWallet={handleConnectWallet} />
                {showConnectPrompt && (
                    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please use the &quot;Connect Wallet&quot; button in the top-right corner to connect your Tezos wallet
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </>
        );
    }

    // Show dashboard if connected
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Your TezBeat Music Collection</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-6">
                    {/* Hero Section - Wallet Stats */}
                    <section className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <WalletInfoWidget
                                    address={address}
                                    network={network}
                                    nftCount={musicNFTs.length}
                                />
                            </div>
                            <StatCard
                                title="Total Plays"
                                value={totalPlays}
                                subtitle="All time"
                                icon={<Play className="h-6 w-6" />}
                            />
                        </div>
                    </section>

                    {/* Recently Played Section */}
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Recently Played</h2>
                        </div>
                        <RecentlyPlayed limit={10} />
                    </section>

                    {/* Discovery + Favorites Section */}
                    <section className="mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <RandomDiscovery />
                            <div className="lg:col-span-2">
                                <h2 className="text-xl font-semibold mb-4">Favorite Tracks</h2>
                                <FavoriteTracks limit={6} />
                            </div>
                        </div>
                    </section>

                    {/* Top Artists Section */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Top Artists</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Based on your collection and listening history
                        </p>
                        <TopArtists limit={6} />
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
