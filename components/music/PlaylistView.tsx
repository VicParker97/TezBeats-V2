"use client";

import { useState } from "react";
import { MusicNFTCard } from "./MusicNFTCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Edit2, Save, X, ListMusic } from "lucide-react";
import type { Playlist } from "@/lib/music/types/playlist";
import { useMusicStore } from "@/lib/music/musicStore";
import { Card, CardContent } from "@/components/ui/card";

interface PlaylistViewProps {
    playlist: Playlist;
}

export function PlaylistView({ playlist }: PlaylistViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(playlist.name);
    const [editDescription, setEditDescription] = useState(playlist.description || "");

    const { updatePlaylist, playPlaylist, getPlaylistTracks, removeFromPlaylist } =
        useMusicStore();

    const tracks = getPlaylistTracks(playlist.id);

    const handleSave = () => {
        if (!editName.trim()) return;

        updatePlaylist(playlist.id, {
            name: editName.trim(),
            description: editDescription.trim() || undefined,
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditName(playlist.name);
        setEditDescription(playlist.description || "");
        setIsEditing(false);
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playPlaylist(playlist.id);
        }
    };

    const handleRemoveTrack = (trackId: string) => {
        removeFromPlaylist(playlist.id, trackId);
    };

    return (
        <div className="space-y-6">
            {/* Playlist Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <Label htmlFor="edit-name">Playlist Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    maxLength={100}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} size="sm">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button onClick={handleCancel} variant="outline" size="sm">
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{playlist.name}</h2>
                            {playlist.description && (
                                <p className="text-muted-foreground mb-4">
                                    {playlist.description}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                            </p>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex gap-2">
                        {tracks.length > 0 && (
                            <Button onClick={handlePlayAll}>
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                Play All
                            </Button>
                        )}
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Details
                        </Button>
                    </div>
                )}
            </div>

            {/* Tracks Grid */}
            {tracks.length === 0 ? (
                <Card>
                    <CardContent className="py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ListMusic className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
                            <p className="text-muted-foreground max-w-md">
                                Add tracks to this playlist from your library by clicking the
                                &quot;Add to Playlist&quot; button on any track card.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {tracks.map((track) => (
                        <div key={track.id} className="relative group">
                            <MusicNFTCard nft={track} />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveTrack(track.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
