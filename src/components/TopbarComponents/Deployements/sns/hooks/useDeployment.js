import { useState } from 'react';
import { Connection } from '@solana/web3.js';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../firebase';
import { exportAndUploadToIPFS, updateOrCreateIpfsRecord, verifyIpfsRecordUpdate } from '../utils';
import { debugLog } from '../utils';

export const useDeployment = (connection, walletAddress, userId, projectId) => {
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

      // Step 3: Updating SNS record (do this BEFORE Firestore to avoid inconsistent state)
      setDeploymentProgress(prev => ({ ...prev, updating: true }));

      const signature = await updateOrCreateIpfsRecord(
        window.solana,
        formattedDomain,
        ipfsUrl
      );

      // Step 4: Confirming transaction — verify the IPFS record was written
      setDeploymentProgress(prev => ({ ...prev, confirming: true }));

      try {
        const rpcEndpoint = import.meta.env.VITE_HELIUS_RPC_URL;
        const verifyConnection = new Connection(rpcEndpoint);
        const { getDomainKey } = await import('@bonfida/spl-name-service');
        const { pubkey: domainKey } = await getDomainKey(formattedDomain);
        await verifyIpfsRecordUpdate(verifyConnection, domainKey, ipfsUrl);
        debugLog('IPFS record verified successfully');
      } catch (verifyError) {
        // Non-fatal: the record may just need time to propagate
        if (import.meta.env.DEV) console.warn('[useDeployment] IPFS record verification failed (may need time to propagate):', verifyError.message);
      }

      // Step 5: Complete — update Firestore only AFTER SNS tx confirmed
      setDeploymentProgress(prev => ({ ...prev, complete: true }));

      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      await updateDoc(projectRef, {
        'websiteSettings.snsDomain': formattedDomain,
        'websiteSettings.walletAddress': walletAddress,
        'websiteSettings.ipfsCid': ipfsHash,
        'websiteSettings.ipfsUrl': ipfsUrl,
        'websiteSettings.deploymentStatus': 'completed',
        'websiteSettings.deploymentTransaction': signature,
        'websiteSettings.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setDeploymentStage('COMPLETE');
      return { signature, formattedDomain };

    } catch (error) {
      setDeploymentError(error);

      // Update Firestore with error
      const projectRef = doc(db, 'projects', userId, 'ProjectRef', projectId);
      try {
        await updateDoc(projectRef, {
          'websiteSettings.deploymentStatus': 'failed',
          'websiteSettings.deploymentError': error.message,
          'websiteSettings.lastUpdated': serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (firestoreError) {
        if (import.meta.env.DEV) console.error('[useDeployment] Firestore status update failed:', firestoreError);
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