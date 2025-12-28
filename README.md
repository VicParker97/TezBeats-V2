# TezBeat - Tezos Music NFT Player

A decentralized music player for your Tezos music NFT collection. Discover, play, and organize your audio NFTs with a beautiful, feature-rich interface.

## 🎵 About

TezBeat is a web-based music player that connects directly to your Tezos wallet to automatically discover and play your music NFTs. Built on the Tezos blockchain, it provides a seamless experience for enjoying your digital music collection with full ownership and decentralization.

## ✨ Features

### Phase 1 (Current Release)
- 🎧 **Music NFT Discovery** - Automatically fetches all audio NFTs from your Tezos wallet
- 🔍 **Advanced Search & Filtering** - Find tracks by name, artist, or collection
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support
- 📊 **NFT Metadata Display** - View comprehensive token information
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 💾 **Persistent Analytics** - Track your listening history and favorites
- 🔐 **Multi-Wallet Support** - Beacon SDK (Temple, Kukai, Umami) + Kukai Embed

### Coming Soon (Phase 2)
- 📂 Custom playlists
- 🎛️ Audio visualizer
- 🌐 NFT marketplace integration
- And more!

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript 5.9** - Type-safe development
- **Taquito v21** - Tezos blockchain interaction
- **Beacon SDK 4.6** - Multi-wallet connection protocol
- **Zustand v5** - Lightweight state management
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **TzKT API** - NFT data indexing
- **IPFS** - Decentralized media storage (Fileship gateway)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/TezBeat.git
cd TezBeat

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see TezBeat in action!

## 🎮 Usage

1. **Connect Your Wallet** - Click "Connect Wallet" and choose your preferred Tezos wallet
2. **Discover Your Music** - TezBeat automatically scans your wallet for audio NFTs
3. **Start Playing** - Click any track to start playback
4. **Explore Features**:
   - Use the search bar to find specific tracks
   - Press `/` to focus search
   - Use `Space` to play/pause
   - Arrow keys for navigation and volume control
   - Press `?` to see all keyboard shortcuts

## 📁 Project Structure

```text
├── app/                    # Next.js App Router
│   ├── library/           # Music library page
│   ├── docs/              # Documentation
│   └── page.tsx           # Dashboard
├── components/
│   ├── music/             # Music player components
│   │   ├── MusicNFTCard.tsx
│   │   ├── WaveformPlayer.tsx
│   │   └── TrackDetailModal.tsx
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Header, navigation
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── music/             # Music NFT logic
│   │   ├── api/           # TzKT API integration
│   │   ├── utils/         # IPFS, metadata parsing
│   │   └── musicStore.ts  # Music state management
│   ├── tezos/             # Tezos wallet integration
│   └── keyboard/          # Keyboard shortcuts
└── public/                # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```bash
# Network configuration (default: ghostnet)
NEXT_PUBLIC_TEZOS_NETWORK=ghostnet

# Custom RPC endpoints (optional)
NEXT_PUBLIC_TEZOS_RPC_MAINNET=https://mainnet.api.tez.ie
NEXT_PUBLIC_TEZOS_RPC_GHOSTNET=https://ghostnet.ecadinfra.com

# TzKT API endpoints (optional)
NEXT_PUBLIC_TZKT_API_MAINNET=https://api.tzkt.io/v1
NEXT_PUBLIC_TZKT_API_GHOSTNET=https://api.ghostnet.tzkt.io/v1
```

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next track |
| `←` | Previous track |
| `Shift + →` | Seek forward 10s |
| `Shift + ←` | Seek backward 10s |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Toggle mute |
| `F` | Toggle favorite |
| `R` | Toggle repeat |
| `S` | Toggle shuffle |
| `/` | Focus search |
| `g + d` | Go to dashboard |
| `g + l` | Go to library |

## 🌐 Supported Audio Formats

TezBeat supports 52 audio MIME types including:
- MP3, WAV, OGG, FLAC, M4A
- AAC, Opus, WebM, AIFF
- And many more!

## 🏗️ Built With

This project was built using the [Next.js Tezos Wallet Boilerplate](https://github.com/skullzarmy/nextjs-tezos-wallet-boilerplate) as a foundation, providing robust wallet integration and Tezos blockchain connectivity.

## 🚀 Deployment

TezBeat is optimized for deployment on Vercel:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

**Note**: The app is configured with `unoptimized: true` for images, making it compatible with Vercel's free tier.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the Tezos blockchain
- Powered by TzKT API for NFT indexing
- IPFS media storage via Fileship gateway
- UI components from shadcn/ui

---

Built with ❤️ for the Tezos music NFT community
