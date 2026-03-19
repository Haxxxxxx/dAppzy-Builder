import React, { forwardRef } from 'react';
import BaseFooter from './BaseFooter';
import { DetailedFooterStyles } from './defaultFooterStyles';

const DetailedFooter = forwardRef((props, ref) => (
  <BaseFooter {...props} ref={ref} defaultStyles={DetailedFooterStyles} />
));

DetailedFooter.displayName = 'DetailedFooter';

export default DetailedFooter;
