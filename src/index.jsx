import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './components/Editor';
import Header from './components/Header';
import './userWorker';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Header />
    <Editor />
  </React.StrictMode>,
  document.getElementById('root')
);
