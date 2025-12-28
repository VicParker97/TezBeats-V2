"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import { Button } from "@/components/ui/button";
import { X, Music, Trash2, Repeat, Repeat1, Shuffle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MusicNFT } from "@/lib/music/types/musicNFT";

// Sortable track item component
function SortableTrackItem({ track, index, isCurrentTrack, onRemove, onPlay }: {
    track: MusicNFT;
    index: number;
    isCurrentTrack: boolean;
    onRemove: (index: number) => void;
    onPlay: (index: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: track.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const artist = track.audioMetadata.artist || track.creator;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group cursor-pointer",
                isCurrentTrack && "bg-primary/10 border border-primary/20",
                isDragging && "opacity-50"
            )}
            {...attributes}
            {...listeners}
        >
            {/* Drag Handle (entire item is draggable) */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onPlay(index);
                }}
                className="flex items-center gap-2 flex-1 min-w-0"
            >
                {/* Track number or playing indicator */}
                <div className="w-6 text-xs text-muted-foreground text-center">
                    {isCurrentTrack ? "▶" : index + 1}
                </div>

                {/* Thumbnail */}
                <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                        src={track.image}
                        alt={track.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                    />
                    {isCurrentTrack && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="text-primary text-xs">▶</div>
                        </div>
                    )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {artist}
                    </p>
                </div>
            </div>

            {/* Remove Button */}
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                }}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}

export function Playlist() {
    const {
        queue,
        currentTrack,
        removeFromQueue,
        playTrackAtIndex,
        clearQueue,
        repeatMode,
        toggleRepeat,
        shuffleMode,
        toggleShuffle,
        reorderQueue,
        saveQueueAsPlaylist,
    } = useMusicStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = queue.findIndex(track => track.id === active.id);
            const newIndex = queue.findIndex(track => track.id === over.id);
            reorderQueue(oldIndex, newIndex);
        }
    };

    const handleClearQueue = () => {
        if (queue.length > 0 && confirm("Clear entire queue?")) {
            clearQueue();
        }
    };

    const handleSaveAsPlaylist = () => {
        const playlistId = saveQueueAsPlaylist();
        if (playlistId) {
            // Optionally show a success message
            console.log("Queue saved as playlist:", playlistId);
        }
    };

    const getRepeatLabel = () => {
        switch (repeatMode) {
            case "one":
                return "Repeat: One";
            case "all":
                return "Repeat: All";
            default:
                return "Repeat: Off";
        }
    };

    if (queue.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Queue is empty</p>
                <p className="text-xs mt-1">Add tracks to start listening</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with controls */}
            <div className="flex items-center justify-between p-2 border-b gap-2">
                <div className="flex items-center gap-1">
                    {/* Shuffle */}
                    <Button
                        variant={shuffleMode ? "secondary" : "ghost"}
                        size="icon"
                        onClick={toggleShuffle}
                        className="h-7 w-7"
                        title="Shuffle"
                    >
                        <Shuffle className="h-3 w-3" />
                    </Button>

                    {/* Repeat */}
                    <Button
                        variant={repeatMode !== 'off' ? "secondary" : "ghost"}
                        size="icon"
                        onClick={toggleRepeat}
                        className="h-7 w-7"
                        title={getRepeatLabel()}
                    >
                        {repeatMode === 'one' ? (
                            <Repeat1 className="h-3 w-3" />
                        ) : (
                            <Repeat className="h-3 w-3" />
                        )}
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    {/* Save as Playlist */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveAsPlaylist}
                        className="h-7 text-xs gap-1"
                        title="Save queue as playlist"
                    >
                        <Save className="h-3 w-3" />
                    </Button>

                    {/* Clear Queue */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearQueue}
                        className="h-7 text-xs gap-1"
                    >
                        <Trash2 className="h-3 w-3" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Queue tracks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={queue.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {queue.map((track, index) => (
                            <SortableTrackItem
                                key={track.id}
                                track={track}
                                index={index}
                                isCurrentTrack={currentTrack?.id === track.id}
                                onRemove={removeFromQueue}
                                onPlay={playTrackAtIndex}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Footer */}
            <div className="p-2 border-t text-xs text-muted-foreground text-center">
                {queue.length} {queue.length === 1 ? "track" : "tracks"}
            </div>
        </div>
    );
}
