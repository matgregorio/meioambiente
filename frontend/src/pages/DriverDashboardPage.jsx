import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import DriverModal from '../components/DriverModal';
import { toast } from 'react-toastify';

function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TYPE_INFO = {
  poda: { name: 'Poda', color: 'bg-green-100 text-green-800' },
  moveis: { name: 'Móveis', color: 'bg-blue-100 text-blue-800' },
  'vidro-eletronicos': { name: 'Vidro e Eletrônicos', color: 'bg-yellow-100 text-yellow-800' }
};

export default function DriverDashboardPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schedules/today');
      setSchedules(data);
    } catch (err) {
      toast.error('Não foi possível carregar as coletas de hoje.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const openModal = (schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleConfirmPickup = async (file) => {
    if (!selectedSchedule) return;
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.patch(`/schedules/${selectedSchedule.protocol}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Recolha confirmada com sucesso.');
      closeModal();
      loadSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível confirmar a recolha.');
    }
  };

  const today = formatDate(new Date());

  return (
    <section className="page active">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Painel do Motorista</h2>
          <p className="text-slate-600">
            Recolhas para hoje: <span className="font-semibold">{today}</span>
          </p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-slate-500">Carregando...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-lg shadow-sm">
          <p className="text-slate-500">Nenhuma recolha pendente para hoje.</p>
        </div>
      ) : (
        <div id="driver-schedule-list" className="space-y-4">
          {schedules.map((schedule) => {
            const typeInfo = TYPE_INFO[schedule.type];
            return (
              <div
                key={schedule.protocol}
                className="bg-white p-5 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-sm font-bold py-1 px-3 rounded-full ${typeInfo?.color}`}>
                      {typeInfo?.name}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">Bairro: {schedule.neighborhoodName}</span>
                  </div>
                  <p className="font-semibold text-lg text-slate-800">{schedule.addressText}</p>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(schedule.addressText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Ver no Mapa
                  </a>
                  <div className="mt-3 border-t pt-3">
                    <p className="text-slate-600 text-sm">
                      <strong>Solicitante:</strong> {schedule.requesterName}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      <strong>Descrição:</strong> {schedule.description || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto md:max-w-[200px]">
                  <button
                    onClick={() => openModal(schedule)}
                    className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Confirmar Recolha
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <DriverModal open={modalOpen} onClose={closeModal} onConfirm={handleConfirmPickup} />
    </section>
  );
}
