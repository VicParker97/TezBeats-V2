"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Disc3, Radio, Sparkles } from "lucide-react";

interface LandingPageProps {
    onConnectWallet: () => void;
}

export function LandingPage({ onConnectWallet }: LandingPageProps) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
                <div className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                                <Music className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            TezBeat
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                            Your Tezos Music NFT Collection, Beautifully Organized and Ready to Play
                        </p>

                        {/* CTA Button */}
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                            onClick={onConnectWallet}
                        >
                            <Music className="h-5 w-5 mr-2" />
                            Connect Wallet & Start Listening
                        </Button>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                            <Card className="border-2 hover:shadow-lg transition-all">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                                        <Disc3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Your NFT Library</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically fetch and display all your music NFTs from the Tezos mainnet
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 hover:shadow-lg transition-all">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                                        <Radio className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Full Playback Control</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Play, pause, shuffle, and repeat with a beautiful waveform visualizer
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 hover:shadow-lg transition-all">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Queue Management</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Create custom playlists and manage your listening queue with ease
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Footer Note */}
                        <p className="text-sm text-muted-foreground mt-16">
                            TezBeat connects to Tezos mainnet and supports all audio NFT formats
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
