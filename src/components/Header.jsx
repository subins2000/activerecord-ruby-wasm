import React from 'react';

const Header = ({ runCode }) => {
  const onLoadDbClick = () => {
    
  }

  const onRunClick = () => {
    runCode()
  }
  
  return (
    <div id="header" className="flex justify-between px-8 py-4 border-b-2 border-black">
      <div>
        <a onClick={onLoadDbClick}>Load DB</a>
      </div>
      <div>
        <button onClick={onRunClick}>Run</button>
      </div>
      <div>
        <a href="https://github.com/subins2000/activerecord-ruby-wasm">GitHub</a>
      </div>
    </div>
  );
};

export default Header;
