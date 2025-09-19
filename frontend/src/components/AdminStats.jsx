import React from 'react';

export default function AdminStats({ stats }) {
  if (!stats) return null;
  const { totalHoje = 0, totalAgendamentos = 0, vagasHoje = { poda: 0, moveis: 0, 'vidro-eletronicos': 0 } } = stats;
  return (
    <div id="admin-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-semibold text-slate-500">Agendamentos Hoje</h4>
        <p className="text-2xl font-bold">{totalHoje}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-semibold text-slate-500">Total de Agendamentos</h4>
        <p className="text-2xl font-bold">{totalAgendamentos}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-semibold text-slate-500">Vagas Hoje (Poda/Móveis/Vidro)</h4>
        <p className="text-2xl font-bold">
          {`${vagasHoje.poda ?? 0} / ${vagasHoje.moveis ?? 0} / ${vagasHoje['vidro-eletronicos'] ?? 0}`}
        </p>
      </div>
    </div>
  );
}
