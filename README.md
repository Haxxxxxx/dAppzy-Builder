# Dappzy - No-Code Solana dApp Builder

Dappzy is an innovative no-code platform for building and deploying decentralized applications (dApps) on the Solana blockchain. Our platform empowers both web3 natives and newcomers to create sophisticated blockchain applications without writing a single line of code.

## 🚀 Core Features

- 🎨 Drag-and-drop interface for building dApps
- 🔗 Native Solana blockchain integration
- 📦 IPFS-based decentralized storage via Pinata
- 🔒 Multi-chain wallet integration
- 🌐 SNS (Solana Name Service) integration
- 🏗️ Pre-built smart contract templates
- 🔄 Real-time updates and state management
- 🎯 Cross-chain compatibility (Solana, Stellar, Ethereum)
- ⚡ Helius RPC integration for enhanced Solana performance

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Ant Design (antd) for UI components
- React Hook Form for form management
- React DnD for drag-and-drop functionality
- React Router v7 for navigation
- React Beautiful DnD for advanced drag-and-drop
- React Dropzone for file uploads

### Blockchain Integration
- @solana/web3.js for Solana blockchain interaction
- @solana/wallet-adapter for wallet connections
- @metaplex-foundation/js for NFT functionality
- @bonfida/spl-name-service for SNS integration
- @pinata/sdk for IPFS storage
- @stellar/freighter-api for Stellar integration
- ethers.js for Ethereum interaction
- Web3.js for additional blockchain functionality
- Helius RPC for enhanced Solana performance and indexing

### Wallet Integration
- **Solana Wallets**
  - Phantom
  - Solflare
  - Slope
  - Sollet
  - Backpack
  - Ledger (Hardware Wallet)
- **Ethereum Wallets**
  - MetaMask
  - Coinbase Wallet
  - Ledger (Hardware Wallet)
- **Stellar Wallets**
  - Freighter
- **Universal Authentication**
  - Unstoppable Domains
  - Web3 React

### Backend & Infrastructure
- Supabase for hosting and backend services
- IPFS for decentralized storage
- Pinata for IPFS pinning service
- Unstoppable Domains and SNS for decentralized domain names
- Axios for API requests
- Nodemailer for email services

### Security & Authentication
- Web3 wallet authentication
- Environment variable encryption
- Input sanitization with DOMPurify
- Transaction validation
- Regular security audits
- Smart contract verification
- Crypto-browserify for cryptographic operations

### Development Tools
- Craco for Create React App configuration
- TypeScript for type safety
- Jest and React Testing Library for testing
- ESLint for code quality
- Node polyfills for browser compatibility

## 🏗️ Architecture

Dappzy's architecture is built around three main components:

1. **Builder Interface**
   - Drag-and-drop component system
   - Real-time preview
   - Component library
   - Template system
   - File upload handling
   - Form validation

2. **Blockchain Integration Layer**
   - Solana program deployment
   - Smart contract management
   - Multi-chain wallet connection handling
   - Transaction processing
   - Cross-chain compatibility
   - NFT functionality
   - Helius RPC integration for enhanced performance
   - Real-time transaction monitoring
   - Advanced indexing and data enrichment

3. **Storage & Hosting**
   - IPFS integration
   - SNS domain management
   - Asset management
   - Deployment pipeline
   - Email notifications
   - File compression (JSZip)
   - Helius webhook integration for real-time updates

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Solana wallet (Phantom recommended)
- A Pinata account for IPFS storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/Dappzy.git
cd Dappzy
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```env
REACT_PINATA_JWT=your_pinata_jwt
REACT_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
REACT_PINATA_KEY=your_pinata_key
REACT_PINATA_SECRET=your_pinata_secret
UD_JWT=your_ud_jwt
REACT_APP_REVERSE_LOOKUP_URL=https://api.ud.com/reverse-lookup
REACT_APP_ENCRYPTION_KEY=your_32_character_encryption_key_here
```

4. Start the development server:
```bash
npm start
```

## 🔒 Security

Dappzy implements comprehensive security measures:
- Environment variable encryption
- Secure token storage
- Input sanitization
- Web3 transaction validation
- Regular security audits
- Smart contract verification

For detailed security information, see [SECURITY.md](SECURITY.md).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## 📚 Documentation

- [Technical Documentation](docs/)
- [API Reference](docs/api.md)
- [Smart Contract Templates](docs/contracts.md)
- [Component Library](docs/components.md)

## 📄 License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) - see the [LICENSE](LICENSE) file for details. This is a copyleft license that requires any derivative works to also be open source and under the same license.

## 🌐 Support & Community

- [Discord Community](https://discord.gg/dappzy)
- [Documentation](docs/)
- [Issue Tracker](https://github.com/your-username/Dappzy/issues)
- Email: contact@dappzy.io

## 🙏 Acknowledgments

- Solana Foundation
- Pinata for IPFS services
- Unstoppable Domains
- The Web3 community
- All contributors and supporters
