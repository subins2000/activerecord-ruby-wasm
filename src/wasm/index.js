import workerFileUrl from "./worker.js?url"

const worker = new Worker(workerFileUrl, { type: 'module' });

export const runRubyCode = code => {
  worker.postMessage({type: "runCode", code})
}

export const initDb = ({ onInitDone }) => {
  worker.onmessage = e => {
    if (e.data.type === "initDone") {
      onInitDone();
    }
  }

  worker.postMessage({ type: "initDb" });
}
