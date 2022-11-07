import { createRoot } from 'react-dom/client';

import './index.css';

import { App } from './components';

const appElement = document.getElementById('app');

if (appElement) {
  createRoot(appElement).render(<App />);
}
