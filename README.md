# ActiveRecord SQLite playground

Ruby on Rails ActiveRecord SQLite playground in the browser. Try it out at https://activerecord-ruby-wasm.subinsb.com/

It works by making use of two different WASMs: [Ruby WASM](https://github.com/ruby/ruby.wasm) and [SQLite WASM](https://github.com/sqlite/sqlite-wasm).

ActiveRecord gem is baked into the ruby wasm binary. A custom SQLite driver is created for ActiveRecord ([thanks to palkan](https://github.com/palkan/wasmify-rails/blob/main/lib/active_record/connection_adapters/sqlite3_wasm_adapter.rb)). This custom driver (mix of Ruby and JavaScript) acts as the middleperson between ActiveRecord and SQLite WASM. ActiveRecord only expects a driver to execute raw SQL and return the result.

This was presented as a lightning talk at [RubyConf India, 2024](www.youtube.com/watch?v=1Em1eCfPzCs). The initial idea was to present something cool at the conf, I [had this WASM idea for a while](https://x.com/SubinSiby/status/1852617951830311420) and decided to build it before/during the conf. Once I tweeted it out, I got to know that the same driver idea [was already implemented](https://x.com/SubinSiby/status/1861837132496789504) but it was a full RoR app!

## Deployment

SQLite WASM OPFS requires [some specific headers](https://sqlite.org/wasm/doc/trunk/persistence.md#coop-coep).

```
npm run build
# use rsync

# Caddy config
activerecord-ruby-wasm.subinsb.com {
  root * /home/user/activerecord-ruby-wasm/dist
  file_server
  header {
    Cross-Origin-Embedder-Policy "require-corp"
    Cross-Origin-Opener-Policy "same-origin"
  }
}
```
