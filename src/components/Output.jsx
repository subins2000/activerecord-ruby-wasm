import React from 'react';

const Output = ({ stdout, stderr }) => {
  return (
    <div className="flex-grow basis-0 mt-2 space-y-4">
      <div className="flex flex-col border-2 border-gray-300">
        <div className="border-b-2 border-gray-300 pl-2">stdout</div>
        <div className="px-2">
          {stdout.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-col border-2 border-gray-300">
        <div className="border-b-2 border-gray-300 pl-2">stderr</div>
        <div className="px-2">
          {stderr.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Output;
