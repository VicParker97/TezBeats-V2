export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'ghostnet';
export const ENV: 'dev' | 'prod' = NETWORK === 'ghostnet' ? 'dev' : 'prod';

// Music Player Configuration
export const MUSIC_PLAYER_CONFIG = {
  network: 'mainnet' as const,
  rpcUrl: 'https://mainnet.api.tez.ie',
  tzktApi: 'https://api.tzkt.io/v1',
  ipfsGateways: [
    'https://ipfs.fileship.xyz/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
  ],
  audioMimeTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/opus',
    'audio/webm',
    'audio/aac',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/flac',
    'audio/x-flac',
    'audio/vnd.wave',
    'audio/aiff',
    'audio/x-aiff',
  ],
};
