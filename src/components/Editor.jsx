import React from 'react';
import { useRef, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const Editor = ({ runCode }) => {
  const [editor, setEditor] = useState(null);
  const monacoEl = useRef(null);

  useEffect(() => {
    if (monacoEl) {
      setEditor((editor) => {
        if (editor) return editor;

        window.monacoEditor = monaco.editor.create(monacoEl.current, {
          value:
`# The sample DB loaded is from https://lab.subinsb.com/kerala-place-name-analysis/

class Place < ActiveRecord::Base
end

puts Place.count
puts Place.columns.map(&:name).join(",")
`,
          language: 'ruby'
        });

        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runCode())

        return window.monacoEditor;
      });
    }

    return () => editor?.dispose();
  }, [monacoEl.current]);

  return <div ref={monacoEl} id="editor" className="py-4 flex-grow basis-0"></div>;
};

export default Editor;
