import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { SalonDataProvider } from './lib/salonData.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SalonDataProvider>
        <Routes>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/superadmin" element={<AdminApp />} />
          <Route path="/superadmin/*" element={<AdminApp />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </SalonDataProvider>
    </BrowserRouter>
  </StrictMode>
);
