// CTAPanel.js
import React from 'react';
    import DraggableCTA from '../../Elements/Structure/DraggableCTA';
const CTAPanel = () => {
  return (
    <div>
      <h3>Create New CTA Section</h3>
      <div className='bento-display-elements' style={{ marginTop: '16px' }}>
        {/* Split CTA components into individual ones */}
        <DraggableCTA configuration="ctaOne" isEditing={false} showDescription={true} />
        <DraggableCTA configuration="ctaTwo" isEditing={false} showDescription={true} />

        {/* Add more CTA components here in the future if needed */}
      </div>
    </div>
  );
};

export default CTAPanel;
