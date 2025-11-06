import React from 'react';

const Header = ({ runCode, onLoadSampleDbClick }) => {
  async function uploadToOpfs(fileInput) {
    try {
      // Access the root directory of OPFS
      const rootDirectory = await navigator.storage.getDirectory();
  
      // Create or get a file handle in OPFS
      const fileHandle = await rootDirectory.getFileHandle("db.sqlite3", {
        create: true,
      });
  
      // Create a writable stream for the file
      const writable = await fileHandle.createWritable();
  
      // Write the uploaded file's content to OPFS
      await writable.write(fileInput);
  
      // Close the writable stream
      await writable.close();
  
      console.log(`${fileInput.name} has been saved to OPFS.`);
    } catch (error) {
      console.error('Error uploading file to OPFS:', error);
    }
  }

  const onLoadDbClick = () => {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = async e => { 
      // getting a hold of the file reference
      var file = e.target.files[0];
      uploadToOpfs(file)
    }

    input.click();
  }

  const onRunClick = () => {
    runCode()
  }
  
  return (
    <div id="header" className="flex justify-between px-1 md:px-8 py-2 md:py-4 border-b-2 border-black">
      <div className="flex space-x-2 md:space-x-4">
        <button onClick={onLoadDbClick}>Open DB</button>
        <button onClick={onLoadSampleDbClick}>Load sample DB</button>
      </div>
      <div>
        <button className="green" onClick={onRunClick}>Run</button>
      </div>
      <div className=" flex items-center">
        <a href="https://github.com/subins2000/activerecord-ruby-wasm">GitHub</a>
      </div>
    </div>
  );
};

export default Header;
