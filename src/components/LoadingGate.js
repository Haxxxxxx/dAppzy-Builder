import React from 'react';
import { BRAND_IMAGES } from '../configs/assetUrls';

/**
 * Branded full-screen loading gate.
 * Used across App.js and BuilderPageLoader for a seamless loading flow.
 */
export default function LoadingGate({ message = 'Loading...' }) {
  return (
    <div className="builder-gate">
      <div className="builder-gate-inner">
        <div className="builder-gate-logo-wrap">
          <div className="builder-gate-ring" />
          <img className="builder-gate-logo" src={BRAND_IMAGES.logo} alt="dappzy" />
        </div>
        <p className="builder-gate-text">{message}</p>
      </div>
    </div>
  );
}
