import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  Agendado: 'text-blue-500',
  'Concluído': 'text-green-500'
};

const TYPE_NAMES = {
  poda: 'Poda',
  moveis: 'Móveis',
  'vidro-eletronicos': 'Vidro e Eletrônicos'
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function VerificationPage() {
  const { protocol } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/verify/${protocol}`);
        setSchedule(data);
        setNotFound(false);
      } catch (err) {
        setNotFound(true);
        toast.error('Agendamento não encontrado.');
      }
    };
    load();
  }, [protocol]);

  return (
    <section className="page active">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-center">Detalhes do Agendamento</h2>
        {notFound ? (
          <div className="text-center text-red-500 font-bold">Agendamento não encontrado.</div>
        ) : !schedule ? (
          <div className="text-center text-slate-500">Carregando...</div>
        ) : (
          <div id="verification-details" className="text-left border-t border-b py-4 mb-6 space-y-2">
            <p className="flex justify-between">
              <strong>Status:</strong>
              <span className={`${STATUS_COLORS[schedule.status]} font-semibold`}>{schedule.status}</span>
            </p>
            <p>
              <strong>Protocolo:</strong> #{schedule.protocol}
            </p>
            <p>
              <strong>Tipo:</strong> {TYPE_NAMES[schedule.type]}
            </p>
            <p>
              <strong>Data:</strong> {formatDate(schedule.date)}
            </p>
            <p>
              <strong>Nome:</strong> {schedule.requesterName}
            </p>
            <p>
              <strong>CPF/CNPJ:</strong> {schedule.cpfCnpj}
            </p>
            <p>
              <strong>Endereço:</strong> {schedule.addressText}, {schedule.neighborhoodName}
            </p>
            <p>
              <strong>Descrição:</strong> {schedule.description || 'N/A'}
            </p>
          </div>
        )}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </section>
  );
}
