import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="page active text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sistema de Agendamento de Recolhas</h2>
        <p className="text-slate-600 mb-10 text-lg">
          Agende a recolha de podas, móveis, vidros e eletrônicos de forma simples e rápida.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link
            to="/schedule"
            className="inline-block w-full md:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-primary-700 transition-all transform hover:scale-105"
          >
            Agendar Nova Recolha
          </Link>
          <Link
            to="/login"
            className="inline-block w-full md:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-8 rounded-lg shadow-md hover:bg-slate-300 transition-all"
          >
            Acesso Restrito
          </Link>
        </div>
      </div>
    </main>
  );
}
