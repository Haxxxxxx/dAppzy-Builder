const handleSelectDomain = async (domain) => {
  try {
    setError(null);
    
    // Validate wallet connection
    if (!window.solana) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
    
    if (!window.solana.isConnected) {
      // Try to connect wallet
      try {
        await window.solana.connect();
        debugLog('Wallet connected successfully');
      } catch (connectError) {
        throw new Error('Failed to connect wallet. Please try again.');
      }
    }
    
    if (!window.solana.publicKey) {
      throw new Error('Wallet public key not found. Please reconnect your wallet.');
    }
    
    debugLog('Starting domain selection with wallet:', {
      publicKey: window.solana.publicKey.toBase58(),
      connected: window.solana.isConnected
    });

    // Deploy to selected domain
    await deployToDomain(domain, elements, websiteSettings, generateFullHtml);
    
    // Update selected domain
    setSelectedDomain(domain);
    
    // Close modal
    onClose();
  } catch (error) {
    console.error('Error in handleSelectDomain:', error);
    setError(error.message);
  }
}; 