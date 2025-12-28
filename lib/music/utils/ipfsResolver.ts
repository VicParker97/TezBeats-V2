// IPFS gateway configuration - using Fileship (Tezos ecosystem gateway)
export const IPFS_GATEWAY = "https://ipfs.fileship.xyz/";

// Legacy array for backward compatibility
export const IPFS_GATEWAYS = [IPFS_GATEWAY];

/**
 * Extract IPFS CID from various URI formats
 */
function extractIPFSHash(uri: string): string {
    if (uri.startsWith("ipfs://")) {
        return uri.replace("ipfs://", "");
    }
    if (uri.includes("/ipfs/")) {
        return uri.split("/ipfs/")[1];
    }
    // Already a naked CID
    return uri;
}

/**
 * Resolve IPFS URI to HTTP URL using Fileship gateway
 * @param uri - IPFS URI (ipfs://...) or naked hash (Qm..., baf...)
 * @returns HTTP URL for the resource
 */
export function resolveAudioUri(uri: string): string {
    if (!uri) return "";

    // Already HTTP/HTTPS - return as is
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri;
    }

    // Extract the IPFS CID
    const cid = extractIPFSHash(uri);

    return `${IPFS_GATEWAY}${cid}`;
}

/**
 * Get the next IPFS gateway URL for the current resource
 * Returns null since we only use one gateway
 * @param currentUri - Current HTTP URL
 * @returns Always null (single gateway mode)
 */
export function getNextGatewayUri(currentUri: string): string | null {
    return null;
}

/**
 * Resolve image URI using Fileship gateway
 */
export function resolveImageUri(uri: string): string {
    if (!uri) return "";

    // Skip HTML content
    if (uri.includes("<") || uri.includes("<!DOCTYPE") || uri.includes("<html>")) {
        return "";
    }

    // Return valid HTTP(S) URIs as-is
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri;
    }

    // Handle data URIs
    if (uri.startsWith("data:image/")) {
        return uri;
    }

    // Convert IPFS URIs
    const cid = extractIPFSHash(uri);
    return `${IPFS_GATEWAY}${cid}`;
}
