import type { MusicNFT, MusicNFTMetadata } from "../types/musicNFT";
import {
    isAudioNFT,
    extractAudioUri,
    extractMimeType,
    extractAudioMetadata,
    extractDisplayUri,
} from "../utils/metadataParser";
import { resolveAudioUri, resolveImageUri } from "../utils/ipfsResolver";

// Mainnet-only configuration
const TZKT_API = "https://api.tzkt.io/v1";

interface TzKTTokenBalance {
    account: {
        address: string;
    };
    token: {
        id: number;
        contract: {
            address: string;
            alias?: string;
        };
        tokenId: string;
        standard: string;
        metadata?: MusicNFTMetadata;
    };
    balance: string;
}

/**
 * Fetch music NFTs from a Tezos address on mainnet with automatic pagination
 * @param address - Tezos wallet address
 * @returns Array of MusicNFT objects
 */
export async function fetchMusicNFTs(address: string): Promise<MusicNFT[]> {
    if (!address) {
        throw new Error("Wallet address is required");
    }

    try {
        const allMusicNFTs: MusicNFT[] = [];
        let offset = 0;
        const limit = 1000; // Max limit allowed by TzKT API
        let hasMore = true;

        // Fetch all pages
        while (hasMore) {
            const response = await fetch(
                `${TZKT_API}/tokens/balances?account=${address}&token.standard=fa2&balance.gt=0&limit=${limit}&offset=${offset}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TzKTTokenBalance[] = await response.json();

            // If we got fewer results than the limit, this is the last page
            if (data.length < limit) {
                hasMore = false;
            }

            // Filter and map to music NFTs
            for (const item of data) {
                const metadata = item.token.metadata;

                // Skip if no metadata
                if (!metadata) continue;

                // Filter: Only NFTs (decimals === "0")
                if (metadata.decimals !== "0") continue;

                // Filter: Only audio NFTs
                if (!isAudioNFT(metadata)) continue;

                // Extract audio URI
                const audioUri = extractAudioUri(metadata);
                if (!audioUri) continue; // Skip if no audio file found

                // Extract display image
                const displayUri = extractDisplayUri(metadata);

                // Extract audio metadata
                const audioMetadata = extractAudioMetadata(metadata);

                // Build MusicNFT object
                const musicNFT: MusicNFT = {
                    id: `${item.token.contract.address}-${item.token.tokenId}`,
                    name: metadata.name || `Token #${item.token.tokenId}`,
                    description: metadata.description || "No description available",
                    audioUri: resolveAudioUri(audioUri), // Resolve IPFS to HTTP
                    image: displayUri ? resolveImageUri(displayUri) : "/placeholder.svg",
                    collection: item.token.contract.alias || `Contract ${item.token.contract.address.slice(0, 10)}...`,
                    creator: audioMetadata.artist || metadata.creators?.[0] || "Unknown",
                    tokenId: item.token.tokenId,
                    contract: item.token.contract.address,
                    balance: item.balance,
                    standard: item.token.standard,
                    metadata,
                    audioMetadata,
                    mimeType: extractMimeType(metadata),
                };

                allMusicNFTs.push(musicNFT);
            }

            // Move to next page
            offset += limit;
        }

        return allMusicNFTs;
    } catch (error) {
        console.error("Failed to fetch music NFTs:", error);
        throw error;
    }
}

/**
 * Fetch music NFTs with pagination support
 * @param address - Tezos wallet address
 * @param limit - Number of results per page (default: 100)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of MusicNFT objects
 */
export async function fetchMusicNFTsPaginated(
    address: string,
    limit: number = 100,
    offset: number = 0
): Promise<MusicNFT[]> {
    if (!address) {
        throw new Error("Wallet address is required");
    }

    try {
        const response = await fetch(
            `${TZKT_API}/tokens/balances?account=${address}&token.standard=fa2&balance.gt=0&limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TzKTTokenBalance[] = await response.json();

        // Filter and map to music NFTs (same logic as fetchMusicNFTs)
        const musicNFTs: MusicNFT[] = [];

        for (const item of data) {
            const metadata = item.token.metadata;

            if (!metadata || metadata.decimals !== "0" || !isAudioNFT(metadata)) {
                continue;
            }

            const audioUri = extractAudioUri(metadata);
            if (!audioUri) continue;

            const displayUri = extractDisplayUri(metadata);
            const audioMetadata = extractAudioMetadata(metadata);

            const musicNFT: MusicNFT = {
                id: `${item.token.contract.address}-${item.token.tokenId}`,
                name: metadata.name || `Token #${item.token.tokenId}`,
                description: metadata.description || "No description available",
                audioUri: resolveAudioUri(audioUri),
                image: displayUri ? resolveImageUri(displayUri) : "/placeholder.svg",
                collection: item.token.contract.alias || `Contract ${item.token.contract.address.slice(0, 10)}...`,
                creator: audioMetadata.artist || metadata.creators?.[0] || "Unknown",
                tokenId: item.token.tokenId,
                contract: item.token.contract.address,
                balance: item.balance,
                standard: item.token.standard,
                metadata,
                audioMetadata,
                mimeType: extractMimeType(metadata),
            };

            musicNFTs.push(musicNFT);
        }

        return musicNFTs;
    } catch (error) {
        console.error("Failed to fetch music NFTs:", error);
        throw error;
    }
}
