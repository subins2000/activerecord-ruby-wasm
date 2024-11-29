import { RubyVM, consolePrinter } from "@ruby/wasm-wasi"

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import dbFile from "../../kerala-places-db.sqlite3?url";

import rubyWasmFileUrl from "./ruby.wasm?url"
import rbCode from "./sqlite3_wasm_adapter.rb?raw"

const response = await fetch(rubyWasmFileUrl)
const module = await WebAssembly.compileStreaming(response)

const vm = new RubyVM();
const printer = consolePrinter({
    stdout: a => console.log(a),
    stderr: a => console.log(a),
});
const imports = {wasi_snapshot_preview1: wasi.wasiImport}
printer.addToImports(imports)
vm.addToImports(imports)
const { instance } = await WebAssembly.instantiate(buffer, imports);
printer.setMemory(instance.exports.memory);
await vm.setInstance(instance);

let db, sqlite3;
window.sqliteExec = function (sql) {
  let cols = [];
  let rows = db.exec(sql, { columnNames: cols, returnValue: "resultRows" });

  return {
    cols,
    rows,
  };
};

const log = msg => console.log(msg)

const initializeSQLite = async () => {
  try {
    log('Loading and initializing SQLite3 module...');
    sqlite3 = await sqlite3InitModule({
      print: log,
      printErr: log,
    });
    log('Done initializing. Running demo...');
  } catch (err) {
    log('Initialization error:', err.name, err.message);
  }
};

await initializeSQLite();
db = new sqlite3.oo1.DB(dbFile, 'ct');

export const runRubyCode = () => {
  console.log("1234")
  const inputCode = window.monacoEditor.getValue()

  console.log(vm.eval(`
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
  
    ${inputCode}
  `));
}
