import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'; // Initialize i18n
import { ConfigProvider } from 'antd'; // Ant Design Global Config

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
            <App />
        </ConfigProvider>
    </React.StrictMode>,
)
console.log('PWA Version: Mobile Nav Update 1.1');
