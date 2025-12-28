"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, Check } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import { truncateAddress } from "@/lib/music/utils/analyticsHelpers";
import { useState } from "react";

interface WalletInfoWidgetProps {
    address: string;
    network: string;
    nftCount: number;
}

export function WalletInfoWidget({ address, network, nftCount }: WalletInfoWidgetProps) {
    const { trackAnalytics, favorites } = useMusicStore();
    const [copied, setCopied] = useState(false);

    // Calculate total plays
    const totalPlays = Object.values(trackAnalytics).reduce(
        (sum, stats) => sum + stats.playCount,
        0
    );

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy address:", err);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">Connected Wallet</h3>
                            <Badge variant={network === "mainnet" ? "default" : "secondary"}>
                                {network}
                            </Badge>
                        </div>

                        {/* Address with copy button */}
                        <div className="flex items-center gap-2 mb-4">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                {truncateAddress(address)}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleCopyAddress}
                                title="Copy address"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl font-bold">{nftCount}</p>
                                <p className="text-xs text-muted-foreground">Music NFTs</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalPlays}</p>
                                <p className="text-xs text-muted-foreground">Total Plays</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{favorites.length}</p>
                                <p className="text-xs text-muted-foreground">Favorites</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
