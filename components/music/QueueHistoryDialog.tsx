"use client";

import { useMusicStore } from "@/lib/music/musicStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Play, Trash2, Music } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueueHistoryDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function QueueHistoryDialog({ trigger, open, onOpenChange }: QueueHistoryDialogProps) {
    const { queueHistory, loadQueueFromHistory, deleteQueueHistory } = useMusicStore();

    const formatRelativeTime = (timestamp: number): string => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

        return new Date(timestamp).toLocaleDateString();
    };

    const handleLoad = (historyId: string) => {
        loadQueueFromHistory(historyId);
        onOpenChange?.(false);
    };

    const handleDelete = (historyId: string) => {
        if (confirm("Delete this queue from history?")) {
            deleteQueueHistory(historyId);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Queue History</DialogTitle>
                    <DialogDescription>
                        View and restore your previously played queues
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[500px] pr-4">
                    {queueHistory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No queue history yet</p>
                            <p className="text-sm mt-1">
                                Your queue history will appear here as you listen
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {queueHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Music className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.tracks.length} track{item.tracks.length !== 1 ? "s" : ""} • {formatRelativeTime(item.playedAt)}
                                            </p>
                                            {item.source && item.source.startsWith("playlist:") && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    From playlist
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleLoad(item.id)}
                                            className="gap-1"
                                        >
                                            <Play className="h-4 w-4" />
                                            Load
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.id)}
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
