import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

const CustomDomainInput = ({ userId, websiteSettings, onDomainUpdated }) => {
  const [customDomain, setCustomDomain] = useState(websiteSettings.customDomain || '');
  const [status, setStatus] = useState('');

  const handleDomainUpdate = async () => {
    if (!customDomain) {
      setStatus('Please enter a valid domain.');
      return;
    }
    try {
      if (!userId) {
        setStatus('Error: User ID is missing.');
        return;
      }
      const projectRef = doc(db, 'projects', userId);
      const updatedSettings = { ...websiteSettings, customDomain: customDomain.trim() };
      await updateDoc(projectRef, {
        websiteSettings: updatedSettings,
        lastUpdated: serverTimestamp(),
      });
      setStatus('Domain updated successfully!');
      if (onDomainUpdated) {
        onDomainUpdated(customDomain);
      }
    } catch (error) {
      console.error('Error updating domain:', error);
      setStatus('Error updating domain: ' + error.message);
    }
  };

  return (
    <div className="custom-domain">
      <h3>Link a Custom Domain</h3>
      <input
        type="text"
        placeholder="Enter your custom domain (e.g., example.com)"
        value={customDomain}
        onChange={(e) => setCustomDomain(e.target.value)}
      />
      <button className="button" onClick={handleDomainUpdate}>
        Update Domain
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default CustomDomainInput;
