import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/AppRouter';
import { AuthProvider } from './hooks/useAuth';
import './styles/index.css';
import 'flatpickr/dist/flatpickr.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <ToastContainer position="top-center" theme="light" pauseOnHover={false} hideProgressBar />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
