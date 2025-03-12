// src/components/ScanDomains.jsx
import React, { useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const ScanDomains = ({ walletAddress, userId, websiteSettings, onDomainSelected }) => {
  const [domains, setDomains] = useState([]);
  const [status, setStatus] = useState('Scanning your wallet for Unstoppable Domains...');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // Use an environment variable for the endpoint if needed; otherwise, default to a relative URL.
        const endpoint = process.env.REACT_APP_REVERSE_LOOKUP_URL;
        const response = await fetch(`${endpoint}?address=${walletAddress}`);
        console.log(endpoint, response);

        if (!response.ok) {
          throw new Error(`Proxy error: ${response.statusText}`);
        }
        const result = await response.json();
        // For the Partner API, we expect a CursorList with an "items" array.
        const items = result.items;
        // For simplicity, take the first domain from the list (if available)
        const domain = items && Array.isArray(items) && items.length > 0 ? items[0].name : null;
        if (domain) {
          setDomains([domain]);
          setStatus('Found a UD domain in your wallet.');
        } else {
          setStatus('No UD domains found in your wallet.');
        }
      } catch (error) {
        console.error('Error scanning wallet for UD domains:', error);
        setStatus('Error scanning wallet: ' + error.message);
      }
    };

    if (walletAddress) {
      fetchDomains();
    }
  }, [walletAddress]);

  const handleDomainSelect = async (selectedDomain) => {
    try {
      const projectRef = doc(db, 'projects', userId);
      const updatedSettings = { ...websiteSettings, customDomain: selectedDomain };
      await updateDoc(projectRef, {
        websiteSettings: updatedSettings,
        lastUpdated: serverTimestamp(),
      });
      setStatus(`Domain "${selectedDomain}" linked to your project successfully!`);
      if (onDomainSelected) onDomainSelected(selectedDomain);
    } catch (error) {
      console.error('Error updating project with selected domain:', error);
      setStatus('Error linking domain: ' + error.message);
    }
  };

  return (
    <div className="scan-domains">
      <h3>Scan Your Wallet for Unstoppable Domains</h3>
      <p>{status}</p>
      {domains.length > 0 ? (
        <div>
          <p>Select a domain to use for your website:</p>
          <ul>
            {domains.map((domain, index) => (
              <li key={index}>
                <button onClick={() => handleDomainSelect(domain)}>{domain}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>
            It appears you don’t own any Unstoppable Domains NFTs in your wallet. Please visit{' '}
            <a href="https://unstoppabledomains.com/" target="_blank" rel="noopener noreferrer">
              Unstoppable Domains
            </a>{' '}
            to purchase a domain.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScanDomains;
