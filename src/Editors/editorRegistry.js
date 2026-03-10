import React from 'react';

const editorRegistry = {
  TypographyEditor: React.lazy(() => import('./TypographyEditor')),
  BorderEditor: React.lazy(() => import('./BorderEditor')),
  SizeEditor: React.lazy(() => import('./SizeEditor')),
  SpacingEditor: React.lazy(() => import('./SpacingEditor')),
  DisplayEditor: React.lazy(() => import('./DisplayEditor')),
  ShadowEditor: React.lazy(() => import('./ShadowEditor')),
  OpacityEditor: React.lazy(() => import('./OpacityEditor')),
  TransformEditor: React.lazy(() => import('./TransformEditor')),
  PositionEditor: React.lazy(() => import('./PositionEditor')),
  FilterEditor: React.lazy(() => import('./FilterEditor')),
  TransitionEditor: React.lazy(() => import('./TransitionEditor')),
  BackgroundEditor: React.lazy(() => import('./BackgroundEditor')),
};

export default editorRegistry;
