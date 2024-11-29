import React from 'react';
import { runRawRubyCode, runRubyCode } from '../wasm';

const Header = ({ runCode }) => {
  const onLoadDbClick = () => {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = async e => { 
      // getting a hold of the file reference
      var file = e.target.files[0];
      console.log(URL.createObjectURL(file))
      window.loadDb(URL.createObjectURL(file))
    }

    input.click();
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
