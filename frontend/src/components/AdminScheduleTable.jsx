import React from 'react';

const TYPE_INFO = {
  poda: { name: 'Poda', color: 'bg-green-100 text-green-800' },
  moveis: { name: 'Móveis', color: 'bg-blue-100 text-blue-800' },
  'vidro-eletronicos': { name: 'Vidro e Eletrônicos', color: 'bg-yellow-100 text-yellow-800' }
};

const STATUS_INFO = {
  Agendado: { color: 'bg-blue-100 text-blue-800' },
  'Concluído': { color: 'bg-green-100 text-green-800' }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminScheduleTable({ schedules, onComplete, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              Protocolo
            </th>
            <th scope="col" className="px-6 py-3">
              Data
            </th>
            <th scope="col" className="px-6 py-3">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3">
              Solicitante
            </th>
            <th scope="col" className="px-6 py-3">
              Endereço
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const typeInfo = TYPE_INFO[schedule.type];
            const statusInfo = STATUS_INFO[schedule.status];
            return (
              <tr key={schedule.protocol} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">#{schedule.protocol}</td>
                <td className="px-6 py-4">{formatDate(schedule.date)}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${typeInfo?.color}`}>
                    {typeInfo?.name}
                  </span>
                </td>
                <td className="px-6 py-4">{schedule.requesterName}</td>
                <td className="px-6 py-4">{schedule.addressText}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${statusInfo?.color}`}>
                    {schedule.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap flex justify-end gap-4">
                  {schedule.status === 'Agendado' && (
                    <button
                      onClick={() => onComplete(schedule)}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Concluir
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(schedule)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {schedules.length === 0 && (
        <div id="admin-no-results" className="text-center p-6">
          <p className="text-slate-500">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </div>
  );
}
