import WasmWorker from "./worker.js?worker"

const worker = new WasmWorker();

export const runRubyCode = code => {
  worker.postMessage({type: "runCode", code})
}

export const registerWorkerCallbacks = ({ onInitDone, onStdoutWrite, onStderrWrite }) => {
  worker.onmessage = e => {
    if (e.data.type === "initDone") {
      onInitDone();
    } else if (e.data.type === "stdoutWrite") {
      onStdoutWrite(e.data.str);
    } else if (e.data.type === "stderrWrite") {
      onStderrWrite(e.data.str);
    }
  }
}
