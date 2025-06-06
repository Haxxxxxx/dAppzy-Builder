import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../firebase';
import { exportAndUploadToIPFS, updateOrCreateIpfsRecord, verifyIpfsRecordUpdate } from '../utils';
import { debugLog } from '../utils';

export const useDeployment = (connection, walletAddress, userId) => {
  const [deploymentStage, setDeploymentStage] = useState('SELECTING');
  const [deploymentProgress, setDeploymentProgress] = useState({
    preparing: false,
    uploading: false,
    updating: false,
    confirming: false,
    complete: false
  });
  const [deploymentError, setDeploymentError] = useState(null);

  const deployToDomain = async (selectedDomain, elements, websiteSettings, generateFullHtml) => {
    if (!selectedDomain || !connection) return;
    
    try {
      setDeploymentError(null);
      setDeploymentStage('DEPLOYING');
      
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
      
      debugLog('Starting deployment with wallet:', {
        publicKey: window.solana.publicKey.toBase58(),
        connected: window.solana.isConnected
      });

      // Step 1: Prepare
      setDeploymentProgress(prev => ({ ...prev, preparing: true }));
      
      // Format domain name
      const formattedDomain = selectedDomain.name.endsWith('.sol') 
        ? selectedDomain.name 
        : `${selectedDomain.name}.sol`;
      
      // Step 2: Uploading
      setDeploymentProgress(prev => ({ ...prev, uploading: true }));
      
      // Upload to IPFS
      const { ipfsHash, ipfsUrl } = await exportAndUploadToIPFS(
        elements, 
        websiteSettings, 
        userId, 
        generateFullHtml
      );
      
      // Save to Firestore
      const projectRef = doc(db, 'projects', userId);
      await updateDoc(projectRef, {
        'websiteSettings.snsDomain': formattedDomain,
        'websiteSettings.walletAddress': walletAddress,
        'websiteSettings.ipfsCid': ipfsHash,
        'websiteSettings.ipfsUrl': ipfsUrl,
        'websiteSettings.lastUpdated': serverTimestamp(),
        'websiteSettings.deploymentStatus': 'pending',
        'websiteSettings.deploymentTransaction': null,
        updatedAt: serverTimestamp()
      });
      
      // Step 3: Updating
      setDeploymentProgress(prev => ({ ...prev, updating: true }));
      
      // Update SNS record
      const signature = await updateOrCreateIpfsRecord(
        window.solana,  // Pass the full wallet object
        formattedDomain,
        ipfsUrl
      );

      // Step 4: Complete
      setDeploymentProgress(prev => ({ ...prev, complete: true }));
      
      // Update Firestore
      await updateDoc(projectRef, {
        'websiteSettings.deploymentStatus': 'completed',
        'websiteSettings.deploymentTransaction': signature,
        'websiteSettings.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setDeploymentStage('COMPLETE');
      return { signature, formattedDomain };

    } catch (error) {
      console.error('Error deploying to SNS domain:', error);
      setDeploymentError(error);
      
      // Update Firestore with error
      const projectRef = doc(db, 'projects', userId);
      try {
        await updateDoc(projectRef, {
          'websiteSettings.deploymentStatus': 'failed',
          'websiteSettings.deploymentError': error.message,
          'websiteSettings.lastUpdated': serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        console.error('Error updating Firestore:', firestoreError);
      }
      
      throw error;
    }
  };

  return {
    deploymentStage,
    deploymentProgress,
    deploymentError,
    deployToDomain
  };
}; 