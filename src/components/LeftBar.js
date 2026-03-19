import React, { useState, Suspense } from 'react';
import './css/LeftBar.css';
const SupportPopup = React.lazy(() => import('./LeftbarPanels/SupportPopup'));
const UpgradePopup = React.lazy(() => import('./UpgradePopup'));
import { useSubscription } from '../context/SubscriptionContext';

const LeftBar = ({
  openPanel,
  onShowSidebar,
  onShowMediaPanel,
  onShowStructurePanel,
  onShowSettingsPanel,
  onShowAIPanel,
}) => {
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const { isPioneer, isLoading: subscriptionLoading } = useSubscription();

  if (subscriptionLoading) return null;

  return (
    <div className="leftbar">
      <div className="buttons-group">
        <button
          onClick={onShowSidebar}
          className={`icon-button ${openPanel === 'sidebar' ? 'active' : ''}`}
          title="Add Elements"
        >
          <span className="material-symbols-outlined">add</span>
        </button>

        <button
          onClick={onShowMediaPanel}
          className={`icon-button ${openPanel === 'media' ? 'active' : ''}`}
          title="Media Library"
        >
          <span className="material-symbols-outlined">perm_media</span>
        </button>

        <button
          onClick={onShowStructurePanel}
          className={`icon-button ${openPanel === 'structure' ? 'active' : ''}`}
          title="Layers"
        >
          <span className="material-symbols-outlined">layers</span>
        </button>

        <button
          onClick={onShowSettingsPanel}
          className={`icon-button ${openPanel === 'settings' ? 'active' : ''}`}
          title="Site Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {isPioneer && (
          <button
            onClick={onShowAIPanel}
            className={`icon-button ${openPanel === 'ai' ? 'active' : ''}`}
            title="AI Assistant"
          >
            <span className="material-symbols-outlined">smart_toy</span>
          </button>
        )}
      </div>

      <div className="help-center">
        {!isPioneer && (
          <button
            className="upgrade-button"
            onClick={() => setShowUpgradePopup(true)}
            title="Upgrade to Pioneer"
          >
            <span className="material-symbols-outlined">workspace_premium</span>
          </button>
        )}
        <button className="help-center-button" onClick={() => setShowSupportPopup(true)}>
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>

      {showSupportPopup && (
        <Suspense fallback={null}>
          <SupportPopup onClose={() => setShowSupportPopup(false)} />
        </Suspense>
      )}

      {showUpgradePopup && (
        <Suspense fallback={null}>
          <UpgradePopup onClose={() => setShowUpgradePopup(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default LeftBar;
