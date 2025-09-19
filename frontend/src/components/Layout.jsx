import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const showHome = location.pathname !== '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600"
          >
            <path d="M11 18a2 2 0 0 0 2.22-1.83l1.5-8.52a2 2 0 0 0-1.07-2.33l-5.3-2.5a2 2 0 0 0-2.33 1.07l-1.5 8.52a2 2 0 0 0 1.83 2.22Z" />
            <path d="m14 10-4.5 4.5" />
            <path d="M10 17.5V19a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1.5" />
            <path d="M16 10h.5a2 2 0 0 1 2 2v2.5" />
            <path d="M18 10a2 2 0 0 0-2-2h-1.5" />
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Recolha<span className="text-primary-600">Fácil</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold">
              Sair
            </button>
          )}
          {showHome && (
            <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
              Início
            </Link>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
