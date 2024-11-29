import React, {useState, useEffect} from 'react';

import { Hook, Console, Decode } from 'console-feed'

const Output = ({logs, setLogs}) => {
  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => setLogs((currLogs) => [...currLogs, log]),
      false
    )
    return () => Unhook(hookedConsole)
  }, [])
  
  return (
    <div className="px-2">
      <Console logs={logs} variant="dark" />
    </div>
  );
};

export default Output;
