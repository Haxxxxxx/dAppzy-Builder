import React from 'react';
import { ConnectionStatus } from '../components';
import { CONNECTION_STATUS } from '../constants';

const DomainSelectorHeader = ({
  connectionStatus,
  connectionError,
  domainsError
}) => {
  return (
    <div className="domain-selection-modal-header">
      <div className="domain-selection-modal-header-title-container">
        <h2 className="domain-selection-modal-header-title">Custom Domain</h2>
        <ConnectionStatus status={connectionStatus} />
        {!connectionError && !domainsError ? null : (
          <div className="error-message">
            {connectionError || domainsError?.message}
          </div>
        )}
      </div>
      <div className="domain-selection-modal-header-bot-container">
        <img 
          className='domain-selection-modal-header-bot-img' 
          src='../img/sns-icon.png' 
          alt="SNS" 
        />
        <p className="domain-selection-modal-header-bot-text">powered by SNS</p>
      </div>
    </div>
  );
};

export default DomainSelectorHeader; 