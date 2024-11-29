import React from 'react';

const Header = () => {
  const onLoadDbClick = () => {
    
  }
  
  return (
    <div id="header" className="flex justify-between px-8 py-4 border-b-2 border-black">
      <div>
        <a onClick={onLoadDbClick}>Load DB</a>
      </div>
      <div>
        <button>Run</button>
      </div>
      <div>
        <a href="https://github.com/subins2000/activerecord-ruby-wasm">GitHub</a>
      </div>
    </div>
  );
};

export default Header;
