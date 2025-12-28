import type { Royalties } from "../types/musicNFT";

export function formatRoyalties(royalties: Royalties): { address: string; percentage: string }[] {
    const { shares, decimals } = royalties;
    const divisor = Math.pow(10, decimals);

    return Object.entries(shares).map(([address, share]) => {
        const percentage = (Number(share) / divisor) * 100;
        return {
            address,
            percentage: `${percentage.toFixed(2)}%`,
        };
    });
}

export function getTotalRoyaltyPercentage(royalties: Royalties): string {
    const { shares, decimals } = royalties;
    const divisor = Math.pow(10, decimals);

    const total = Object.values(shares).reduce((sum, share) => {
        return sum + Number(share) / divisor;
    }, 0);

    return `${(total * 100).toFixed(2)}%`;
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
