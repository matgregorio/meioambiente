import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import AdminStats from '../components/AdminStats';
import AdminScheduleTable from '../components/AdminScheduleTable';
import AddressManager from '../components/AddressManager';
import DeleteModal from '../components/DeleteModal';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ q: '', date: '', status: '' });
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, payload: null });

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/schedules', { params });
      setSchedules(data.data || []);
    } catch (err) {
      toast.error('Não foi possível carregar os agendamentos.');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadStats = async () => {
    try {
      const [todayRes, totalsRes] = await Promise.all([api.get('/stats/today'), api.get('/stats/totals')]);
      setStats({
        totalHoje: todayRes.data.totalHoje,
        vagasHoje: todayRes.data.vagasHoje,
        totalAgendamentos: totalsRes.data.totalAgendamentos
      });
    } catch (err) {
      toast.error('Não foi possível carregar as estatísticas.');
    }
  };

  const loadNeighborhoods = async () => {
    try {
      const { data } = await api.get('/addresses/neighborhoods');
      const detailed = await Promise.all(
        data.map(async (bairro) => {
          const response = await api.get('/addresses', { params: { neighborhoodId: bairro._id } });
          return {
            id: bairro._id,
            name: bairro.name,
            streets: response.data.map((street) => ({ id: street._id, name: street.street }))
          };
        })
      );
      setNeighborhoods(detailed);
    } catch (err) {
      toast.error('Não foi possível carregar os endereços.');
    }
  };

  useEffect(() => {
    loadStats();
    loadNeighborhoods();
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [filters]);

  const handleComplete = async (schedule) => {
    try {
      const formData = new FormData();
      await api.patch(`/schedules/${schedule.protocol}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Agendamento concluído.');
      loadSchedules();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível concluir o agendamento.');
    }
  };

  const openDeleteModal = (type, payload) => {
    setDeleteModal({ open: true, type, payload });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, type: null, payload: null });
  };

  const confirmDelete = async () => {
    const { type, payload } = deleteModal;
    try {
      if (type === 'schedule') {
        await api.delete(`/schedules/${payload.protocol}`);
        toast.success('Agendamento removido.');
        loadSchedules();
        loadStats();
      } else if (type === 'neighborhood') {
        await api.delete(`/addresses/neighborhoods/${payload.id}`);
        toast.success('Bairro removido.');
        loadNeighborhoods();
      } else if (type === 'address') {
        await api.delete(`/addresses/${payload.street.id}`);
        toast.success('Rua removida.');
        loadNeighborhoods();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível concluir a operação.');
    } finally {
      closeDeleteModal();
    }
  };

  const handleAddNeighborhood = async (name) => {
    try {
      await api.post('/addresses/neighborhoods', { name });
      toast.success('Bairro adicionado.');
      loadNeighborhoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar o bairro.');
    }
  };

  const handleAddAddress = async (neighborhoodId, street) => {
    try {
      await api.post('/addresses', { neighborhoodId, street });
      toast.success('Endereço adicionado.');
      loadNeighborhoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível adicionar o endereço.');
    }
  };

  const modalConfig = useMemo(() => {
    if (!deleteModal.open) return { title: '', description: '' };
    if (deleteModal.type === 'schedule') {
      return {
        title: 'Remover Agendamento',
        description: 'Tem a certeza de que deseja remover este agendamento? Esta ação não pode ser desfeita.'
      };
    }
    if (deleteModal.type === 'neighborhood') {
      return {
        title: 'Remover Bairro',
        description: 'Atenção! Ao remover este bairro, todas as ruas associadas a ele também serão excluídas. Deseja continuar?'
      };
    }
    return {
      title: 'Remover Rua',
      description: 'Tem a certeza de que deseja remover esta rua?'
    };
  }, [deleteModal]);

  return (
    <section className="page active">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Painel do Administrador</h2>
      </div>
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`admin-tab ${activeTab === 'schedules' ? 'active' : ''}`}
          >
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`admin-tab ${activeTab === 'addresses' ? 'active' : ''}`}
          >
            Gerir Endereços
          </button>
        </nav>
      </div>

      {activeTab === 'schedules' && (
        <div>
          <AdminStats stats={stats} />
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-grow w-full md:w-auto">
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                placeholder="Buscar por nome, endereço, protocolo..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border rounded-lg bg-white appearance-none"
              >
                <option value="">Todos os Status</option>
                <option value="Agendado">Agendado</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
            <Link
              to="/schedule"
              className="w-full md:w-auto bg-primary-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className=""
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Novo Agendamento
            </Link>
          </div>
          {loadingSchedules ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : (
            <AdminScheduleTable
              schedules={schedules}
              onComplete={(schedule) => handleComplete(schedule)}
              onDelete={(schedule) => openDeleteModal('schedule', schedule)}
            />
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <AddressManager
          neighborhoods={neighborhoods}
          onAddNeighborhood={handleAddNeighborhood}
          onAddAddress={handleAddAddress}
          onDeleteNeighborhood={(bairro) => openDeleteModal('neighborhood', bairro)}
          onDeleteAddress={(bairro, street) => openDeleteModal('address', { bairro, street })}
        />
      )}

      <DeleteModal
        open={deleteModal.open}
        title={modalConfig.title}
        description={modalConfig.description}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
