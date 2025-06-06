import React from 'react';
import { SnsError, SnsRecordNotInitializedError, SnsOwnershipError, SnsSimulationError } from './errors';

// Error Modal Component
export const ErrorModal = ({ error, onClose, domain }) => {
  const getErrorDetails = () => {
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return {
        title: 'Insufficient SOL Balance',
        message: error.message,
        steps: [
          'Top up your wallet with more SOL.',
          'Try again.'
        ],
        actionUrl: 'https://www.binance.com/en/buy-sell-crypto',
        actionText: 'Buy SOL'
      };
    } else if (error instanceof SnsRecordNotInitializedError) {
      return {
        title: 'Domain Not Initialized',
        message: error.message,
        steps: [
          'Visit the SNS dashboard',
          'Select your domain',
          'Add a website/IPFS record',
          'Try deploying again'
        ],
        actionUrl: 'https://sns.id/',
        actionText: 'Go to SNS Dashboard'
      };
    } else if (error instanceof SnsOwnershipError) {
      return {
        title: 'Ownership Error',
        message: error.message,
        steps: [
          'Verify you are using the correct wallet',
          'Ensure you own the domain',
          'Try again with the correct wallet'
        ],
        actionUrl: 'https://naming.bonfida.org/',
        actionText: 'Check Domain Ownership'
      };
    } else if (error instanceof SnsSimulationError) {
      return {
        title: 'Transaction Error',
        message: error.message,
        steps: [
          'Check your wallet balance',
          'Ensure you have enough SOL for transaction fees',
          'Try again'
        ],
        actionUrl: null,
        actionText: null
      };
    } else {
      return {
        title: 'Deployment Error',
        message: error.message || 'An unexpected error occurred.',
        steps: [
          'Check your internet connection',
          'Verify your wallet is connected',
          'Try again'
        ],
        actionUrl: null,
        actionText: null
      };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-header">
          <div className="error-modal-icon">⚠️</div>
          <h2>{errorDetails.title}</h2>
        </div>

        <div className="error-modal-content">
          <p className="error-modal-message">{errorDetails.message}</p>
          
          <div className="error-modal-domain">
            <strong>Domain:</strong> {domain}
          </div>

          <div className="error-modal-steps">
            <h3>To resolve this issue:</h3>
            <ol>
              {errorDetails.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {errorDetails.actionUrl && (
            <a 
              href={errorDetails.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="error-modal-action-button"
            >
              {errorDetails.actionText}
            </a>
          )}

          <button 
            className="error-modal-retry-button"
            onClick={onClose}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Connection Status Component
export const ConnectionStatus = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'connected':
        return 'connected';
      case 'connecting':
        return 'connecting';
      case 'retrying':
        return 'retrying';
      case 'error':
        return 'error';
      default:
        return 'initializing';
    }
  };

  return (
    <div className={`status-indicator ${getStatusClass()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

// Domain Card Component
export const DomainCard = ({ domain, isSelected, isPrimary, isEnabled, onToggle }) => {
  const fullDomainName = domain.name.endsWith('.sol') ? domain.name : `${domain.name}.sol`;

  return (
    <div
      className={`domain-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary' : ''}`}
      onClick={() => onToggle(domain)}
    >
      <div className="toggle-domain-container">
        <div 
          className={`toggle-switch ${isEnabled ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(domain);
          }}
        >
          <div className="toggle-switch-inner" />
        </div>
      </div>
      <p className="domain-text">{fullDomainName}</p>
      {isPrimary && <span className="primary-badge">Primary</span>}
    </div>
  );
};

// Deployment Timeline Component
export const DeploymentTimeline = ({ progress }) => {
  return (
    <div className="deployment-timeline">
      <div className={`timeline-step ${progress.preparing ? 'active' : ''} ${progress.uploading || progress.updating || progress.confirming || progress.complete ? 'completed' : ''}`}>
        <div className="step-icon">1</div>
        <div className="step-content">
          <h3>Preparing Content</h3>
          <p>Generating and validating website content</p>
        </div>
      </div>

      <div className={`timeline-step ${progress.uploading ? 'active' : ''} ${progress.updating || progress.confirming || progress.complete ? 'completed' : ''}`}>
        <div className="step-icon">2</div>
        <div className="step-content">
          <h3>Uploading to IPFS</h3>
          <p>Storing your website on IPFS</p>
        </div>
      </div>

      <div className={`timeline-step ${progress.updating ? 'active' : ''} ${progress.confirming || progress.complete ? 'completed' : ''}`}>
        <div className="step-icon">3</div>
        <div className="step-content">
          <h3>Updating SNS Record</h3>
          <p>Linking IPFS content to your domain</p>
        </div>
      </div>

      <div className={`timeline-step ${progress.confirming ? 'active' : ''} ${progress.complete ? 'completed' : ''}`}>
        <div className="step-icon">4</div>
        <div className="step-content">
          <h3>Confirming Transaction</h3>
          <p>Waiting for blockchain confirmation</p>
        </div>
      </div>
    </div>
  );
}; 