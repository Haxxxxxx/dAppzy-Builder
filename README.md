# Dappzy

Dappzy is an open-source platform for building and managing decentralized applications (dApps) with a focus on security and user experience.

## Features

- 🔒 Secure token management
- 📦 IPFS integration via Pinata
- 🔗 Web3 wallet integration
- 🎨 Customizable UI components
- 🔄 Real-time updates
- 🔍 Security audit tools

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Pinata account for IPFS storage
- A Web3 wallet (MetaMask recommended)

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

3. Create a `.env` file in the root directory with the following variables:
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

## Security

Dappzy implements several security measures:
- Environment variable management
- Secure token storage
- Input sanitization
- Web3 transaction validation
- Regular security audits

For detailed security information, see [SECURITY.md](SECURITY.md).

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## Testing

Run the test suite:
```bash
npm test
```

Run security audit:
```bash
node scripts/security-audit.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check the [documentation](docs/)
2. Open an issue
3. Contact support@dappzy.io

## Acknowledgments

- Pinata for IPFS services
- The Web3 community
- All contributors and supporters
