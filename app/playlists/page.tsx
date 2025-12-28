"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaylistCard } from "@/components/music/PlaylistCard";
import { CreatePlaylistDialog } from "@/components/music/CreatePlaylistDialog";
import { Button } from "@/components/ui/button";
import { ListMusic, Plus } from "lucide-react";
import { useMusicStore } from "@/lib/music/musicStore";

export default function PlaylistsPage() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const playlists = useMusicStore((state) => state.playlists);

    const handleCreateSuccess = () => {
        // Dialog will close automatically
        // Could add toast notification here
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <ListMusic className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Playlists</h1>
                                <p className="text-sm text-muted-foreground">
                                    Organize your music collection with custom playlists
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Playlist
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 py-6 pb-24">
                    {playlists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ListMusic className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Create your first playlist to start organizing your music
                                collection. You can add tracks from your library to any
                                playlist.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Playlist
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {playlists.map((playlist) => (
                                <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreatePlaylistDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleCreateSuccess}
            />
        </DashboardLayout>
    );
}
