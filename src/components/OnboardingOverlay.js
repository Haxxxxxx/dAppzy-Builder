import React, { useState, useEffect, useCallback } from 'react';
import './css/OnboardingOverlay.css';

const STORAGE_KEY = 'dappzy_onboarding_done';

const STEPS = [
  {
    // Left sidebar "+" button
    targetSelector: '.leftbar .icon-button:first-child',
    text: 'Add elements by dragging from here. Click the + icon to open the elements panel.',
    position: 'right',
  },
  {
    // Canvas area
    targetSelector: '.main-content',
    text: 'Drop elements here to build your page. Click any element to select and edit it.',
    position: 'bottom',
  },
  {
    // Topbar resize controls
    targetSelector: '.resize-controls',
    text: 'Preview at different screen sizes. Test how your site looks on phone, tablet, and desktop.',
    position: 'bottom',
  },
  {
    // Topbar publish / export area
    targetSelector: '.export-section',
    text: 'Export or deploy your site when ready. Publish to IPFS, download HTML, or connect a domain.',
    position: 'bottom',
  },
];

const SPOTLIGHT_PADDING = 8;

/**
 * First-run onboarding overlay that highlights key UI areas.
 * Shows once, then stores completion in localStorage.
 */
const OnboardingOverlay = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(true);

  const currentStep = STEPS[step];

  // Measure the target element for the current step
  const measureTarget = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // Fallback: center of screen if element not found
      setTargetRect({ top: window.innerHeight / 2 - 40, left: window.innerWidth / 2 - 80, width: 160, height: 80 });
    }
  }, [currentStep]);

  useEffect(() => {
    measureTarget();
    // Re-measure on resize
    window.addEventListener('resize', measureTarget);
    return () => window.removeEventListener('resize', measureTarget);
  }, [measureTarget, step]);

  // Small delay to let layout settle after mount
  useEffect(() => {
    const timer = setTimeout(measureTarget, 100);
    return () => clearTimeout(timer);
  }, [measureTarget]);

  const finish = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* localStorage may be unavailable */ }
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [onComplete]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const handleSkip = () => {
    finish();
  };

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finish]);

  if (!targetRect) return null;

  // Compute tooltip position relative to the spotlight target
  const tooltipStyle = {};
  const spotTop = targetRect.top - SPOTLIGHT_PADDING;
  const spotLeft = targetRect.left - SPOTLIGHT_PADDING;
  const spotWidth = targetRect.width + SPOTLIGHT_PADDING * 2;
  const spotHeight = targetRect.height + SPOTLIGHT_PADDING * 2;

  switch (currentStep.position) {
    case 'right':
      tooltipStyle.top = spotTop;
      tooltipStyle.left = spotLeft + spotWidth + 12;
      break;
    case 'bottom':
      tooltipStyle.top = spotTop + spotHeight + 12;
      tooltipStyle.left = spotLeft;
      break;
    case 'left':
      tooltipStyle.top = spotTop;
      tooltipStyle.right = window.innerWidth - spotLeft + 12;
      break;
    case 'top':
    default:
      tooltipStyle.bottom = window.innerHeight - spotTop + 12;
      tooltipStyle.left = spotLeft;
      break;
  }

  // Clamp tooltip to viewport
  if (tooltipStyle.left !== undefined) {
    tooltipStyle.left = Math.max(12, Math.min(tooltipStyle.left, window.innerWidth - 340));
  }
  if (tooltipStyle.top !== undefined) {
    tooltipStyle.top = Math.max(12, Math.min(tooltipStyle.top, window.innerHeight - 200));
  }

  return (
    <div className={`onboarding-backdrop${visible ? '' : ' onboarding-backdrop--hidden'}`}>
      {/* Spotlight cutout */}
      <div
        className="onboarding-spotlight"
        style={{
          top: spotTop,
          left: spotLeft,
          width: spotWidth,
          height: spotHeight,
        }}
      />

      {/* Tooltip */}
      <div className="onboarding-tooltip" style={tooltipStyle}>
        <div className="onboarding-tooltip-text">
          {currentStep.text}
        </div>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`}
            />
          ))}
        </div>

        <div style={{ marginTop: 12 }} />

        <div className="onboarding-tooltip-footer">
          <span className="onboarding-step-counter">{step + 1} / {STEPS.length}</span>
          <div className="onboarding-tooltip-actions">
            <button className="onboarding-skip-btn" onClick={handleSkip}>
              Skip
            </button>
            <button className="onboarding-next-btn" onClick={handleNext}>
              {step === STEPS.length - 1 ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
