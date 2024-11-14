import React from 'react';

const LeftBar = ({ onShowSidebar }) => {
  return (
    <div className="leftbar">
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
  );
};

export default LeftBar;
