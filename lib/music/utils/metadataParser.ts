import type { MusicNFTMetadata, AudioMetadata, Royalties } from "../types/musicNFT";

// Comprehensive audio MIME types
export const AUDIO_MIME_TYPES = [
    // MPEG formats
    "audio/mpeg",
    "audio/mp3",
    "audio/mpeg3",
    "audio/x-mpeg-3",
    "audio/x-mpeg",

    // WAV formats
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/vnd.wave",
    "audio/x-pn-wav",

    // OGG formats
    "audio/ogg",
    "audio/opus",
    "audio/vorbis",
    "audio/x-vorbis",
    "application/ogg",

    // WebM
    "audio/webm",

    // AAC formats
    "audio/aac",
    "audio/aacp",
    "audio/x-aac",

    // MP4/M4A formats
    "audio/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "audio/mp4a-latm",
    "audio/mpeg4-generic",

    // FLAC formats
    "audio/flac",
    "audio/x-flac",

    // AIFF formats
    "audio/aiff",
    "audio/x-aiff",
    "sound/aiff",

    // Other common audio formats
    "audio/basic",
    "audio/midi",
    "audio/x-midi",
    "audio/mid",
    "audio/3gpp",
    "audio/3gpp2",
    "audio/amr",
    "audio/amr-wb",
    "audio/ac3",
    "audio/eac3",
    "audio/vnd.dlna.adts",
    "audio/vnd.dts",
    "audio/vnd.dts.hd",
    "audio/x-ms-wma",
    "audio/x-matroska",
    "audio/weba",
];

// Audio file extensions
const AUDIO_EXTENSIONS = [
    "mp3", "wav", "ogg", "aac", "flac", "m4a", "opus", "webm", "aiff",
    "oga", "weba", "wma", "mid", "midi", "3gp", "3g2", "amr", "ac3",
    "mka", "mpeg", "mpga"
];

/**
 * Check if NFT metadata indicates an audio/music NFT
 */
export function isAudioNFT(metadata: MusicNFTMetadata): boolean {
    if (!metadata) return false;

    // Check formats array for audio MIME types
    if (metadata.formats && Array.isArray(metadata.formats)) {
        const hasAudioFormat = metadata.formats.some((format) => {
            const mimeType = format.mimeType?.toLowerCase() || "";
            return AUDIO_MIME_TYPES.includes(mimeType);
        });

        if (hasAudioFormat) return true;
    }

    // Fallback: Check artifactUri file extension
    const artifactUri = metadata.artifactUri || "";
    if (artifactUri) {
        const ext = artifactUri.split(".").pop()?.toLowerCase() || "";
        return AUDIO_EXTENSIONS.includes(ext);
    }

    return false;
}

/**
 * Extract audio URI from NFT metadata
 * Priority: formats array > artifactUri
 */
export function extractAudioUri(metadata: MusicNFTMetadata): string | null {
    if (!metadata) return null;

    // Priority 1: Check formats array for audio file
    if (metadata.formats && Array.isArray(metadata.formats)) {
        const audioFormat = metadata.formats.find((format) => {
            const mimeType = format.mimeType?.toLowerCase() || "";
            return AUDIO_MIME_TYPES.includes(mimeType);
        });

        if (audioFormat?.uri) {
            return audioFormat.uri;
        }
    }

    // Priority 2: Use artifactUri if it's an audio file
    if (metadata.artifactUri) {
        const ext = metadata.artifactUri.split(".").pop()?.toLowerCase() || "";
        if (AUDIO_EXTENSIONS.includes(ext)) {
            return metadata.artifactUri;
        }
    }

    // Priority 3: Check for common audio field names
    const audioFields = ["audio", "content_url", "audioUri"];
    for (const field of audioFields) {
        const value = (metadata as Record<string, unknown>)[field];
        if (typeof value === "string" && value) {
            return value;
        }
    }

    return null;
}

/**
 * Extract MIME type from NFT metadata
 */
export function extractMimeType(metadata: MusicNFTMetadata): string | undefined {
    if (!metadata) return undefined;

    // Check formats array
    if (metadata.formats && Array.isArray(metadata.formats)) {
        const audioFormat = metadata.formats.find((format) => {
            const mimeType = format.mimeType?.toLowerCase() || "";
            return AUDIO_MIME_TYPES.includes(mimeType);
        });

        if (audioFormat?.mimeType) {
            return audioFormat.mimeType;
        }
    }

    // Fallback: Guess from URI extension
    const uri = extractAudioUri(metadata);
    if (uri) {
        const ext = uri.split(".").pop()?.toLowerCase() || "";
        const mimeTypeMap: Record<string, string> = {
            mp3: "audio/mpeg",
            wav: "audio/wav",
            ogg: "audio/ogg",
            aac: "audio/aac",
            flac: "audio/flac",
            m4a: "audio/mp4",
            opus: "audio/opus",
            webm: "audio/webm",
            aiff: "audio/aiff",
            oga: "audio/ogg",
            weba: "audio/webm",
            wma: "audio/x-ms-wma",
            mid: "audio/midi",
            midi: "audio/midi",
            "3gp": "audio/3gpp",
            "3g2": "audio/3gpp2",
            amr: "audio/amr",
            ac3: "audio/ac3",
            mka: "audio/x-matroska",
            mpeg: "audio/mpeg",
            mpga: "audio/mpeg",
        };

        return mimeTypeMap[ext];
    }

    return undefined;
}

/**
 * Extract audio-specific metadata (artist, album, duration, genre)
 */
export function extractAudioMetadata(metadata: MusicNFTMetadata): AudioMetadata {
    const audioMetadata: AudioMetadata = {};

    // Extract from creators array
    if (metadata.creators && Array.isArray(metadata.creators) && metadata.creators.length > 0) {
        audioMetadata.artist = metadata.creators[0];
    }

    // Extract from attributes array
    if (metadata.attributes && Array.isArray(metadata.attributes)) {
        for (const attr of metadata.attributes) {
            const name = attr.name?.toLowerCase() || "";
            const value = attr.value;

            if (name === "artist" || name === "creator") {
                audioMetadata.artist = audioMetadata.artist || value;
            } else if (name === "album") {
                audioMetadata.album = value;
            } else if (name === "duration") {
                audioMetadata.duration = value;
            } else if (name === "genre") {
                audioMetadata.genre = value;
            } else if (name === "year") {
                audioMetadata.year = value;
            }
        }
    }

    // Fallback: Check top-level fields
    const metadataRecord = metadata as Record<string, unknown>;
    audioMetadata.artist = audioMetadata.artist || (metadataRecord.artist as string | undefined);
    audioMetadata.album = audioMetadata.album || (metadataRecord.album as string | undefined);
    audioMetadata.genre = audioMetadata.genre || (metadataRecord.genre as string | undefined);

    return audioMetadata;
}

/**
 * Parse royalties from TZIP-21 royalties object
 * Returns royalty percentage as a string (e.g., "10%")
 */
export function parseRoyalties(metadata: MusicNFTMetadata): string | null {
    if (!metadata.royalties) return null;

    const { decimals = 0, shares } = metadata.royalties;

    if (!shares || Object.keys(shares).length === 0) return null;

    // Sum up all royalty shares
    const totalRoyalties = Object.values(shares).reduce((sum, share) => {
        const shareValue = parseInt(share, 10) || 0;
        return sum + shareValue;
    }, 0);

    // Calculate percentage based on decimals
    const percentage = totalRoyalties / Math.pow(10, decimals);

    return `${percentage.toFixed(1)}%`;
}

/**
 * Get display image URI (for album art)
 * Priority: displayUri > thumbnailUri > image
 */
export function extractDisplayUri(metadata: MusicNFTMetadata): string | null {
    if (!metadata) return null;

    const uris = [metadata.displayUri, metadata.thumbnailUri, metadata.image].filter(Boolean);

    for (const uri of uris) {
        if (typeof uri === "string" && uri.trim()) {
            // Skip HTML content
            if (uri.includes("<") || uri.includes("<!DOCTYPE") || uri.includes("<html>")) {
                continue;
            }
            return uri;
        }
    }

    return null;
}
