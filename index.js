import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import dbFile from "./db.sqlite3?url";

const response = await fetch("./ruby.wasm")
const module = await WebAssembly.compileStreaming(response)

const { vm } = await DefaultRubyVM(module);

const rbCodeFetch = await fetch("./code.rb")
const rbCode = await rbCodeFetch.text()

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
    console.log('Initialization error:', err.name, err.message);
  }
};

await initializeSQLite();
db = new sqlite3.oo1.DB(dbFile, 'ct');

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

  ActiveRecord::Schema.define do
    create_table :humans do |t|
      t.string :name
      t.string :house_name
      t.string :gender
      t.integer :age
      t.integer :polling_station
      t.string :district
    end
  end
`);