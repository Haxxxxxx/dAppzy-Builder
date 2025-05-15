import React, { useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { pinataJwt } from '../../../utils/configPinata';
import './DomainsStyles.css';

const PINATA_PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const ScanDomains = ({
  userId,
  walletAddress,        // <-- New prop: the user's ETH address
  elements,
  buildHierarchy,
  websiteSettings,
  onDomainSelected,
  onCancel,
  setAutoSaveStatus,
  generateFullHtml,
  saveProjectToFirestore
}) => {
  const [deploymentStage, setDeploymentStage] = useState('SELECTING');
  const [domains, setDomains] = useState([]);
  const [status, setStatus] = useState('Scanning your wallet for Unstoppable Domains...');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enabledDomains, setEnabledDomains] = useState({});

  // -----------------------------------------------------
  // 1) Fetch UD domains from your Cloud Function
  // -----------------------------------------------------
  useEffect(() => {
    const fetchUDDomains = async () => {
      if (!walletAddress) {
        setStatus('No wallet address provided.');
        setIsLoading(false);
        return;
      }
      setStatus('Scanning your wallet for Unstoppable Domains...');
      setIsLoading(true);

      try {
        // Replace with your actual function URL
        // e.g. "https://us-central1-yourProject.cloudfunctions.net/reverseLookup"
        const functionUrl = "https://reverselookup-xkek6fohuq-uc.a.run.app";
        // Build the final endpoint with the user's address
        const endpoint = `${functionUrl}?address=${walletAddress}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`UD lookup failed: ${response.statusText}`);
        }
        const data = await response.json();

        // The Partner API v3 returns an object with an "items" array
        // Each item typically has a "name" property (the UD domain)
        if (data.items && data.items.length > 0) {
          const foundDomains = data.items.map((item) => item.name);
          setDomains(foundDomains);
          setStatus('Found UD domains in your wallet.');
        } else {
          setStatus('No UD domains found in your wallet.');
        }
      } catch (error) {
        console.error('Error fetching UD domains:', error);
        setStatus(`Error scanning wallet for UD domains: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUDDomains();
  }, [walletAddress]);

  // -----------------------------------------------------
  // 2) Pin files to Pinata => returns final IPFS URL
  // -----------------------------------------------------
  const pinDirectoryToPinata = async (files, metadata) => {
    const formData = new FormData();
    files.forEach(({ file, fileName }) => {
      formData.append('file', file, fileName);
    });
    formData.append('pinataOptions', JSON.stringify({ wrapWithDirectory: true }));
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch(PINATA_PIN_FILE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Pinata pinFileToIPFS failed: ${response.statusText}`);
    }
    return response.json();
  };

  // -----------------------------------------------------
  // 3) Deploy to IPFS on demand
  // -----------------------------------------------------
  const handleDeployToIPFS = async () => {
    setAutoSaveStatus('Publishing to IPFS...');
    try {
      if (!userId) {
        setAutoSaveStatus('Error: No valid user ID found!');
        return null;
      }
      const fullHtml = generateFullHtml();
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const files = [{ file: htmlBlob, fileName: `${userId}/index.html` }];

      const metadata = {
        name: websiteSettings.siteTitle || 'MyWebsite',
        keyvalues: { userId },
      };
      const result = await pinDirectoryToPinata(files, metadata);
      const cid = result.IpfsHash;
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}/${userId}`;

      // Optionally save to Firestore
      await saveProjectToFirestore(userId, fullHtml, 'ipfs', ipfsUrl);

      setAutoSaveStatus('IPFS deploy complete!');
      return ipfsUrl;
    } catch (error) {
      setAutoSaveStatus(`Error publishing to IPFS: ${error.message}`);
      console.error('IPFS error:', error);
      return null;
    }
  };

  // -----------------------------------------------------
  // 4) Link domain in Firestore
  // -----------------------------------------------------
  const linkDomainInFirestore = async (domainValue) => {
    const projectRef = doc(db, 'projects', userId);
    const updatedSettings = { ...websiteSettings, customDomain: domainValue };
    await updateDoc(projectRef, {
      websiteSettings: updatedSettings,
      lastUpdated: serverTimestamp(),
    });
  };

  // -----------------------------------------------------
  // 5) When user selects a domain & clicks "Select Domain"
  // -----------------------------------------------------
  const handleSelectDomain = async () => {
    if (!selectedDomain) return;

    try {
      setDeploymentStage('DEPLOYING');
      setStatus('Deployment in Progress...');

      let finalUrl = null;
      if (selectedDomain === 'Use IPFS fallback') {
        // Deploy to IPFS
        finalUrl = await handleDeployToIPFS();
        if (!finalUrl) {
          setStatus('IPFS deploy failed. Cannot proceed.');
          return;
        }
        await linkDomainInFirestore(finalUrl);
      } else {
        // If user picks a UD domain or default domain
        await linkDomainInFirestore(selectedDomain);
        finalUrl = `https://${selectedDomain}`;
      }

      setDeploymentStage('COMPLETE');
      setStatus('Deployment Complete!');
      setAutoSaveStatus('All changes saved.');

      // Optionally open the new tab in background
      const newTab = window.open(finalUrl, '_blank', 'noopener,noreferrer');
      if (newTab) {
        newTab.blur();
        window.focus();
      }

    } catch (error) {
      console.error('Error linking domain:', error);
      setStatus('Error linking domain: ' + error.message);
    }
  };

  const handleDomainToggle = (domainName) => {
    setEnabledDomains(prev => {
      const newState = {};
      // Disable all other domains
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Toggle the clicked domain
      newState[domainName] = !prev[domainName];
      return newState;
    });

    // Update selected domain
    setSelectedDomain(prev => prev === domainName ? null : domainName);
  };

  // -----------------------------------------------------
  // 6) Render domain cards
  // -----------------------------------------------------
  const renderDomainCards = () => {
    if (isLoading) {
      return (
        <div className="domain-selection-modal-content-fetching-domains">
          <p className="domain-selection-modal-content-fetching-domains-text">
            Fetching domains...
          </p>
          <div className="domain-selection-modal-content-fetching-domains-loader" />
        </div>
      );
    }

    // Start with UD domains from the user's wallet
    const domainCards = [...domains];

    // Add IPFS fallback
    domainCards.push('Use IPFS fallback');

    if (domainCards.length === 0) return null;

    return domainCards.map((domainName, index) => {
      const isEnabled = enabledDomains[domainName] || false;

      return (
      <div
        key={index}
          className={`domain-card ${isEnabled ? 'selected' : ''}`}
          onClick={() => handleDomainToggle(domainName)}
      >
          <div className="toggle-domain-container">
            <div 
              className={`toggle-switch ${isEnabled ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDomainToggle(domainName);
              }}
            >
              <div className="toggle-switch-inner" />
            </div>
        </div>
        <p className="domain-text">{domainName}</p>
      </div>
      );
    });
  };

  // -----------------------------------------------------
  // 7) Conditional UI
  // -----------------------------------------------------
  if (deploymentStage === 'DEPLOYING') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
        <button className="close-btn" onClick={onCancel}>×</button>
        <div className="deployment-status">
          <div className="spinner" />
          <h2>Deployment in Progress</h2>
          <p>Your project is currently being deployed. This may take a few moments.</p>
          </div>
        </div>
      </div>
    );
  }

  if (deploymentStage === 'COMPLETE') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
        <button className="close-btn" onClick={onCancel}>×</button>
        <div className="deployment-status">
          <div className="check-circle" />
          <h2>Deployment Complete</h2>
          <p>Your project has been successfully deployed and is now live.</p>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, "SELECTING"
  return (
    <div className="domain-selection-modal-bg">
    <div className="domain-selection-modal">
      <button className="close-btn" onClick={onCancel}>×</button>

      <h2>Choose a Domain</h2>
      <p className="subtitle">
          Select your Unstoppable Domain or IPFS fallback to deploy on IPFS.
      </p>

      <p className="status">{status}</p>

        {renderDomainCards()}

      <div className="buttons">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
          <button 
            className="select-btn" 
            onClick={handleSelectDomain}
            disabled={!selectedDomain}
          >
          Select Domain
        </button>
      </div>

        <p className="no-domains-message">
          If you don't own any Unstoppable Domains NFTs in your wallet. Please visit{' '}
          <a href="https://unstoppabledomains.com/" target="_blank" rel="noopener noreferrer">
            Unstoppable Domains
          </a>{' '}
          to purchase a domain.
        </p>
      </div>
    </div>
  );
};

export default ScanDomains;
