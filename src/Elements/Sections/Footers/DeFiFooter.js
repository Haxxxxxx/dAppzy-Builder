import React, { forwardRef } from 'react';
import BaseFooter from './BaseFooter';
import { DeFiFooterStyles } from './defaultFooterStyles';

const DeFiFooter = forwardRef((props, ref) => (
  <BaseFooter {...props} ref={ref} defaultStyles={DeFiFooterStyles} />
));

DeFiFooter.displayName = 'DeFiFooter';

export default DeFiFooter;
