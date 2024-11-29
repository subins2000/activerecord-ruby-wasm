import React, {useState} from "react";

import Header from './Header';
import Editor from './Editor';
import Output from './Output';

import {runRubyCode} from "../wasm/index"

const App = () => {
  const [logs, setLogs] = useState([])

  const runCode = () => {
    setLogs([])
    console.log(runRubyCode(window.monacoEditor.getValue()).toString())
  }

  return (
    <>
      <Header runCode={runCode} />
      <div className="flex space-x-4">
        <Editor />
        <Output logs={logs} setLogs={setLogs} />
      </div>
    </>
  )
};

export default App;
