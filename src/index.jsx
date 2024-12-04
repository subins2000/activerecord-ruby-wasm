import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import './userWorker';
import './wasm'

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
