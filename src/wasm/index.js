import workerFileUrl from "./worker.js?url"

const worker = new Worker(workerFileUrl, { type: 'module' });

export const runRubyCode = code => {
  worker.postMessage({type: "run", code})
}
