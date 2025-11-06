import React from 'react';

const Output = ({ stdout, stderr }) => {
  return (
    <div className="flex-grow mt-2">
      <div className="flex flex-col space-y-4 border-1 border-gray-300">
        <div className="border-b-1 border-gray-300">stdout</div>
        <div className="px-2">
          {stdout.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      <div>stderr</div>
      <div className="px-2">
        {stderr.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default Output;
