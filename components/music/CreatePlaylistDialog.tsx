"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMusicStore } from "@/lib/music/musicStore";

interface CreatePlaylistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (playlistId: string) => void;
}

export function CreatePlaylistDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreatePlaylistDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createPlaylist = useMusicStore((state) => state.createPlaylist);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        setIsSubmitting(true);

        try {
            const playlistId = createPlaylist(
                name.trim(),
                description.trim() || undefined
            );

            // Reset form
            setName("");
            setDescription("");
            onOpenChange(false);

            // Call success callback
            if (onSuccess) {
                onSuccess(playlistId);
            }
        } catch (error) {
            console.error("Failed to create playlist:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setName("");
        setDescription("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Playlist</DialogTitle>
                    <DialogDescription>
                        Create a custom playlist to organize your music collection
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Playlist"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                {name.length}/100 characters
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your playlist..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                {description.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Playlist"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
