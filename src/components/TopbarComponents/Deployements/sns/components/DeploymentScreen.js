import React from 'react';
import { ErrorModal, DeploymentTimeline } from '../components';

const DeploymentScreen = ({
  deploymentStage,
  deploymentProgress,
  deploymentError,
  selectedDomain,
  onClose,
  onViewSite
}) => {
  if (deploymentStage === 'DEPLOYING') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="deployment-status">
            {deploymentError ? (
              <ErrorModal
                error={deploymentError}
                onClose={onClose}
                domain={selectedDomain?.name}
              />
            ) : (
              <>
                <div className="spinner" />
                <h2>Deployment in Progress</h2>
                <p>Your project is currently being deployed to your SNS domain. This may take a few moments.</p>
                <DeploymentTimeline progress={deploymentProgress} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (deploymentStage === 'COMPLETE') {
    return (
      <div className="domain-selection-modal-bg">
        <div className="domain-selection-modal deployment-modal">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="deployment-status">
            <div className="check-circle" />
            <h2>Deployment Complete</h2>
            <p>Your project has been successfully deployed to your SNS domain.</p>
            <DeploymentTimeline progress={{ ...deploymentProgress, complete: true }} />
            <div className="deployment-actions">
              <button 
                className="view-site-btn"
                onClick={onViewSite}
              >
                View Site
              </button>
              <button 
                className="close-deployment-btn"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DeploymentScreen; 