import React from 'react';
import { useRef, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const Editor = () => {
  const [editor, setEditor] = useState(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;

        window.monacoEditor = monaco.editor.create(monacoEl.current, {
          value:
`ActiveRecord::Schema.define do
  create_table :places do |t|
    t.string :name
    t.string :lat
    t.string :lon
    t.timestamps
  end
  add_index :places, :name, unique: true
end

class Place < ActiveRecord::Base
end

puts Place.count
`,
          language: 'ruby'
        });

        return monacoEditor
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div ref={monacoEl} id="editor" className="py-4"></div>;
};

export default Editor;
