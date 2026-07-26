/**
 * Entry point for the React application.
 * This is where everything starts!
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Create a root and render the App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)