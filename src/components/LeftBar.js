import React from 'react';

const LeftBar = ({ onShowSidebar }) => {
  return (
    <div className="leftbar">
      <div className="buttons-group">
        <button onClick={onShowSidebar}>
          1
        </button>
        <button>
          2
        </button>
        <button>
          3
        </button>
        <button>
          4
        </button>
      </div>
      <div className="help-center">
        <button className='help-center-button'>HC</button>
      </div>
    </div>
  );
};

export default LeftBar;
