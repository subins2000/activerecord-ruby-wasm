import React, {useState, useEffect} from "react";

import Header from './Header';
import Editor from './Editor';
import Output from './Output';

import exampleDbUrl from "../example-db.sqlite3?url"

import {registerWorkerCallbacks, runRubyCode} from "../wasm/index"

const App = () => {
  const [stdout, setStdout] = useState([])
  const [stderr, setStderr] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  const runCode = () => {
    setStdout([])
    setStderr([])
    runRubyCode(window.monacoEditor.getValue())
  }

  useEffect(async () => {
    const rootDir = await navigator?.storage?.getDirectory();
    try {
      await rootDir.getFileHandle('db.sqlite3', { create: false });
      console.log("OPFS: /db.sqlite3 exists");
    } catch (err) {
      if (err && err.name === "NotFoundError") {
        console.log("OPFS: /db.sqlite3 does not exist. Fetching and saving sample places db...");
        const blob = await fetch(exampleDbUrl).then(response => response.blob());
        const fileHandle = await rootDir.getFileHandle('db.sqlite3', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        console.warn("OPFS: error checking db.sqlite3", err);
      }
    }
    registerWorkerCallbacks({
      onInitDone: () => setIsLoading(false),
      onStdoutWrite: (str) => setStdout((currStdout) => [...currStdout, str]),
      onStderrWrite: (str) => setStderr((currStderr) => [...currStderr, str])
    });
  }, []);

  return (
    <>
      <Header runCode={runCode} />
      <div className="flex space-x-4 h-full w-full">
        {isLoading ? <center className="text-center pl-4 pt-4">Loading...</center> : (
          <>
            <Editor />
            <Output stdout={stdout} stderr={stderr} />
          </>
        )}
      </div>
    </>
  )
};

export default App;
