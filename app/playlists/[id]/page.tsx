"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaylistView } from "@/components/music/PlaylistView";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ListMusic } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PlaylistDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { id } = use(params);

    const playlist = useMusicStore((state) => state.getPlaylist(id));

    if (!playlist) {
        return (
            <DashboardLayout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <ListMusic className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Playlist Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            The playlist you&apos;re looking for doesn&apos;t exist or has been
                            deleted.
                        </p>
                        <Link href="/playlists">
                            <Button>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Playlists
                            </Button>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header with Breadcrumb */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link
                            href="/playlists"
                            className="hover:text-foreground transition-colors"
                        >
                            Playlists
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">{playlist.name}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/playlists")}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Playlists
                    </Button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-6 pb-24">
                    <PlaylistView playlist={playlist} />
                </div>
            </div>
        </DashboardLayout>
    );
}
