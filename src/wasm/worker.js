import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

import rubyWasmFileUrl from "./ruby.wasm?url"
import rbCode from "./sqlite3_wasm_adapter.rb?raw"

const log = console.log;
const error = console.error;

let vm, wasi, db, sqlite3;

const initVm = async () => {
  const response = await fetch(rubyWasmFileUrl)
  const module = await WebAssembly.compileStreaming(response)
  const rubyVm = await DefaultRubyVM(module, {consolePrint: false});
  vm = rubyVm.vm
  wasi = rubyVm.wasi
}

const initSqlite = async () => {
  try {
    log('Loading and initializing SQLite3 module...');
    sqlite3 = await sqlite3InitModule({ print: log, printErr: error });
    log('Running SQLite3 version', sqlite3.version.libVersion);
    log('Done initializing.');
  } catch (err) {
    error('Initialization error:', err.name, err.message);
  }
};

const initJsDb = () => {
  if (typeof db !== "undefined") {
    db.close()
  }

  // Log the size of the OPFS /db.sqlite3 file if OPFS is available
  navigator.storage.getDirectory().then(rootDir => {
    rootDir.getFileHandle('db.sqlite3', { create: false }).then(fileHandle => {
      return fileHandle.getFile();
    }).then(file => {
      log(`OPFS: /db.sqlite3 size: ${file.size} bytes`);
    }).catch(err => {
      log('Could not get /db.sqlite3 file size from OPFS:', err);
    });
  });

  db = new sqlite3.oo1.OpfsDb('/db.sqlite3');
  log(
    'opfs' in sqlite3
      ? `OPFS is available, persisted database at ${db.filename}`
      : `OPFS is not available, transient database ${db.filename}`,
  );
};

// Hack: binding to console to easily access from js context of ruby
console.sqliteExec = function (sql) {
  log("Executing query:", sql);
  try {
    let cols = [];
    let rows = db.exec(sql, { columnNames: cols, returnValue: "resultRows" });

    return {
      cols,
      rows,
    };
  } catch (e) {
    console.log(e)
  }
};

console.sqliteChanges = function () {
  return db.changes();
};

console.stdoutWrite = function (str) {
  postMessage({ type: "stdoutWrite", str })
}

console.stderrWrite = function (str) {
  postMessage({ type: "stderrWrite", str })
}

const initActiveRecord = () => {
  vm.eval(`
    require "/bundle/setup"
    require "js"
    require "active_record"

    $stdout = Object.new.tap do |obj|
      def obj.write(str)
        JS.global[:console].stdoutWrite(str)
      end
    end

    $stderr = Object.new.tap do |obj|
      def obj.write(str)
        JS.global[:console].stderrWrite(str)
      end
    end

    def require(f)
      Kernel::require(f) unless f == "socket" || f == "sqlite3"
    end

    def gem(a, b)
      Kernel::gem(a, b) unless a == "sqlite3"
    end

    class Socket
      AF_INET6 = true

      class << self
        def method_missing(sym, *) = nil
      end
    end

    class SocketError; end

    ${rbCode}

    ActiveRecord::ConnectionAdapters.register("sqlite3_wasm", "ActiveRecord::ConnectionAdapters::SQLite3WasmAdapter", "active_record/connection_adapters/sqlite3_wasm_adapter")

    ActiveRecord::Base.establish_connection(
      adapter: 'sqlite3_wasm',
      database: 'db.sqlite3',
      reaping_frequency: 0
    )
  `)
};

const runRubyCode = async inputCode => {
  const jsResult = await vm.evalAsync(inputCode)
  
  console.log(wasi.fds[1], wasi.fds[2], wasi.fds[0], wasi.fds[3])
  const result = new TextDecoder().decode(wasi.fds[2].file.data)
  
  console.log("bbbb", result)
  postMessage({ type: "runCodeResult", result });
}

const initDbConnection = async () => {
  initJsDb();
}

onmessage = e => {
  if (e.data["type"] == "reloadDb") {
    initDbConnection();
  } else if (e.data["type"] == "runCode") {
    runRubyCode(e.data["code"])
  }
}

async function init() {
  await initVm();
  await initSqlite();
  initActiveRecord();
  await initDbConnection();
  postMessage({ type: "initDone" });
}

init();
