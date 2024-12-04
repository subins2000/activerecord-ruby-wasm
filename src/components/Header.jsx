import React from 'react';

const Header = ({ runCode }) => {
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
    <div id="header" className="flex justify-between px-8 py-4 border-b-2 border-black">
      <div>
        <a onClick={onLoadDbClick}>Load DB</a>
      </div>
      <div>
        <button onClick={onRunClick}>Run</button>
      </div>
      <div>
        <a href="https://github.com/subins2000/activerecord-ruby-wasm">GitHub @subins2000</a>
      </div>
    </div>
  );
};

export default Header;
