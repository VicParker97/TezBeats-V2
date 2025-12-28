// Music NFT Types based on TZIP-21 standard

export interface AudioFormat {
    uri: string;
    mimeType: string;
    fileName?: string;
    fileSize?: string;
}

export interface AudioMetadata {
    artist?: string;
    album?: string;
    duration?: string;
    genre?: string;
    year?: string;
    [key: string]: string | undefined;
}

export interface Royalties {
    decimals: number;
    shares: Record<string, string>;
}

export interface MusicNFTMetadata {
    name?: string;
    description?: string;
    artifactUri?: string;
    displayUri?: string;
    thumbnailUri?: string;
    formats?: AudioFormat[];
    creators?: string[];
    attributes?: Array<{
        name: string;
        value: string;
    }>;
    royalties?: Royalties;
    decimals?: string;
    [key: string]: unknown;
}

export interface MusicNFT {
    id: string;
    name: string;
    description: string;
    audioUri: string;
    image: string;
    collection: string;
    creator: string;
    tokenId: string;
    contract: string;
    balance: string;
    standard: string;
    metadata: MusicNFTMetadata;
    audioMetadata: AudioMetadata;
    mimeType?: string;
}

export interface MusicPlayerState {
    currentTrack: MusicNFT | null;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    currentTime: number;
    duration: number;
}

export type RepeatMode = 'off' | 'one' | 'all';
