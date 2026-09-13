import React from 'react';
import ReactDOM from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { App } from './App';
import './index.css';

// Обязательная инициализация VK Mini Apps SDK per docs dev.vk.com
vkBridge.send('VKWebAppInit');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
