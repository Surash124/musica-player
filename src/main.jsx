// main.jsx
// Entry point — the very first file that runs
// Mounts the React app into index.html

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'    // global styles + Tailwind imports
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// document.getElementById('root') → finds the <div id="root"> in index.html
// createRoot() → tells React to take control of that div
// .render() → renders App inside it

// StrictMode → development helper
// renders every component twice in dev mode
// to catch bugs like missing cleanup in useEffect
// has zero effect in production build