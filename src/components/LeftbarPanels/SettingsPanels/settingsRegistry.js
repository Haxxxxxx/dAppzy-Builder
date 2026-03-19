import React from 'react';

const settingsRegistry = {
  WalletSettings: React.lazy(() => import('./WalletSettings')),
  LinkSettings: React.lazy(() => import('./LinkSettings')),
  TextualSettings: React.lazy(() => import('./TextualSettings')),
  ListSettings: React.lazy(() => import('./ListSettings')),
  ImageSettings: React.lazy(() => import('./ImageSettings')),
  VideoSettings: React.lazy(() => import('./VideoSettings')),
  YoutubeSettings: React.lazy(() => import('./YoutubeSettings')),
  DeFiSectionSettings: React.lazy(() => import('./DeFiSectionSettings')),
  BackgroundSettings: React.lazy(() => import('./BackgroundSettings')),
  FormSettings: React.lazy(() => import('./FormSettings')),
  DeFiModuleSettings: React.lazy(() => import('./DeFiModuleSettings')),
  MintingSectionSettings: React.lazy(() => import('./MintingSectionSettings')),
  MintingModuleSettings: React.lazy(() => import('./MintingModuleSettings')),
  TableSettings: React.lazy(() => import('./TableSettings')),
  IconSettings: React.lazy(() => import('./IconSettings')),
  InteractiveSettings: React.lazy(() => import('./InteractiveSettings')),
};

export default settingsRegistry;
