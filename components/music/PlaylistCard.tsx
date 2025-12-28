"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Edit2, ListMusic, ChevronDown, Shuffle, ListPlus } from "lucide-react";
import type { Playlist } from "@/lib/music/types/playlist";
import { useMusicStore } from "@/lib/music/musicStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlaylistCardProps {
    playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { playPlaylist, deletePlaylist, getPlaylistTracks } = useMusicStore();

    const tracks = getPlaylistTracks(playlist.id);
    const trackCount = playlist.trackIds.length;

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (trackCount > 0) {
            playPlaylist(playlist.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/playlists/${playlist.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        deletePlaylist(playlist.id);
        setShowDeleteDialog(false);
    };

    const handleCardClick = () => {
        router.push(`/playlists/${playlist.id}`);
    };

    // Create thumbnail grid from first 4 tracks
    const thumbnailTracks = tracks.slice(0, 4);
    const hasThumbnails = thumbnailTracks.length > 0;

    return (
        <>
            <Card
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleCardClick}
            >
                <CardContent className="p-0 relative">
                    <div className="aspect-square w-full relative bg-muted">
                        {hasThumbnails ? (
                            <div
                                className={`grid ${
                                    thumbnailTracks.length === 1
                                        ? "grid-cols-1"
                                        : "grid-cols-2"
                                } w-full h-full`}
                            >
                                {thumbnailTracks.map((track, index) => (
                                    <div key={index} className="relative w-full h-full">
                                        <Image
                                            src={track.image}
                                            alt={track.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 12.5vw"
                                            className="object-cover"
                                            loading="lazy"
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <ListMusic className="w-16 h-16 text-muted-foreground/50" />
                            </div>
                        )}

                        {isHovered && trackCount > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                                <Button
                                    size="icon"
                                    className="rounded-full w-14 h-14"
                                    onClick={handlePlay}
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full w-12 h-12"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ChevronDown className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPlaylist(playlist.id);
                                            }}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Play Now (Replace Queue)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPlaylist(playlist.id, { append: true });
                                            }}
                                        >
                                            <ListPlus className="mr-2 h-4 w-4" />
                                            Add to Queue
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPlaylist(playlist.id, { shuffle: true });
                                            }}
                                        >
                                            <Shuffle className="mr-2 h-4 w-4" />
                                            Shuffle Play
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-2 p-4">
                    <div className="w-full">
                        <h3 className="font-semibold text-base line-clamp-1">
                            {playlist.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {trackCount} {trackCount === 1 ? "track" : "tracks"}
                        </p>
                        {playlist.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {playlist.description}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleEdit}
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{playlist.name}&quot;? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
