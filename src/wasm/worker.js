import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

import rubyWasmFileUrl from "./ruby.wasm?url"
import rbCode from "./sqlite3_wasm_adapter.rb?raw"

const response = await fetch(rubyWasmFileUrl)
const module = await WebAssembly.compileStreaming(response)

const { vm } = await DefaultRubyVM(module);

const log = console.log;
const error = console.error;

let db, sqlite3;

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

const initActiveRecord = () => {
  vm.eval(`
    require "/bundle/setup"
    require "js"
    require "active_record"

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

const runRubyCode = inputCode => {
  log(vm.eval(inputCode));
}

const initDbConnection = async () => {
  initJsDb();
}

onmessage = e => {
  if (e.data["type"] == "initDb") {
    initDbConnection();
  } else if (e.data["type"] == "runCode") {
    runRubyCode(e.data["code"])
  }
}

async function init() {
  await initSqlite();
  initActiveRecord();
  await initDbConnection();
  postMessage({ type: "initDone" });
}

init();
