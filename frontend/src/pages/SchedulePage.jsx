import React, { useEffect, useMemo, useRef, useState } from 'react';
import Flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import api from '../lib/api';
import { toast } from 'react-toastify';

const SCHEDULE_TYPES = {
  poda: { key: 'poda', label: 'Poda', dayLabel: 'Terça-feira', weekday: 2, limit: 3 },
  moveis: { key: 'moveis', label: 'Móveis', dayLabel: 'Quarta-feira', weekday: 3, limit: 8 },
  'vidro-eletronicos': {
    key: 'vidro-eletronicos',
    label: 'Vidro e Eletrônicos',
    dayLabel: 'Quinta-feira',
    weekday: 4,
    limit: 8
  }
};

function formatDateInput(date) {
  const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return iso.split('T')[0];
}

function cleanNumber(value) {
  return value.replace(/\D/g, '');
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const pickerRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/public/addresses')
      .then((res) => setAddresses(res.data))
      .catch(() => toast.error('Não foi possível carregar os endereços.'));
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    api
      .get(`/schedules/availability/${selectedType.key}`)
      .then((res) => setUnavailableDates(res.data.unavailableDates || []))
      .catch(() => setUnavailableDates([]));
  }, [selectedType]);

  useEffect(() => {
    if (!selectedType) return;
    if (pickerRef.current) {
      pickerRef.current.destroy();
    }
    pickerRef.current = Flatpickr(dateInputRef.current, {
      locale: Portuguese,
      minDate: 'today',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd de F de Y',
      disable: [
        (date) => {
          if (!selectedType) return true;
          if (date.getDay() !== selectedType.weekday) return true;
          const dateStr = formatDateInput(date);
          if (unavailableDates.includes(dateStr)) return true;
          const cutoff = new Date(date);
          cutoff.setDate(cutoff.getDate() - 1);
          cutoff.setHours(16, 30, 0, 0);
          return new Date() > cutoff;
        }
      ],
      onChange: (dates) => {
        if (dates.length > 0) {
          setSelectedDate(formatDateInput(dates[0]));
          setAddressError('');
        }
      }
    });
    pickerRef.current.open();
    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [selectedType, unavailableDates]);

  useEffect(() => {
    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, []);

  const filteredAddresses = useMemo(() => {
    if (!searchTerm) return addresses;
    return addresses.filter((addr) => addr.street.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [addresses, searchTerm]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedDate('');
    setSelectedAddress('');
    setSelectedNeighborhood('');
    setAddressError('');
  };

  const handleAddressChange = (value) => {
    setSelectedAddress(value);
    const found = addresses.find((addr) => addr.street === value);
    setSelectedNeighborhood(found ? found.neighborhood : '');
  };

  const cpfMask = useMemo(() => {
    const digits = cleanNumber(cpfCnpj);
    return digits.length > 11 ? '99.999.999/9999-99' : '999.999.999-99';
  }, [cpfCnpj]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedType || !selectedDate) {
      toast.error('Selecione o tipo de recolha e uma data.');
      return;
    }
    const selectedOption = addresses.find((addr) => addr.street === selectedAddress);
    if (!selectedOption) {
      setAddressError('Selecione um endereço válido.');
      return;
    }
    setLoading(true);
    setAddressError('');
    try {
      const payload = {
        type: selectedType.key,
        date: selectedDate,
        addressId: selectedOption.id,
        requesterName: fullName,
        cpfCnpj: cleanNumber(cpfCnpj),
        phone: cleanNumber(phone),
        description: description || undefined
      };
      const { data } = await api.post('/schedules', payload);
      toast.success('Agendamento confirmado!');
      navigate(`/confirmation/${data.protocol}`);
    } catch (error) {
      if (error.response?.status === 409) {
        setAddressError(error.response.data?.message || 'Não foi possível confirmar o agendamento.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao criar agendamento.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setSelectedDate('');
    setSelectedAddress('');
    setSelectedNeighborhood('');
    setFullName('');
    setCpfCnpj('');
    setPhone('');
    setDescription('');
    setAddressError('');
    setSearchTerm('');
  };

  return (
    <section className="page active">
      <h2 className="text-2xl font-bold mb-6">Novo Agendamento</h2>
      <div className={loading ? 'hidden' : ''}>
        <div id="step-1">
          <label className="block text-lg font-semibold mb-2">1. Selecione o tipo de recolha:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(SCHEDULE_TYPES).map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => handleTypeSelect(type)}
                className={`schedule-type-btn text-left p-6 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all ${
                  selectedType?.key === type.key ? 'border-primary-500 bg-primary-50' : ''
                }`}
              >
                <h3 className="text-xl font-bold">{type.label}</h3>
                <p className="text-slate-500">Recolhas às {type.dayLabel.toLowerCase()}s.</p>
              </button>
            ))}
          </div>
        </div>
        <div id="step-2" className={`${selectedType ? 'mt-6' : 'hidden'}`}>
          <label className="block text-lg font-semibold mb-2">
            2. Escolha uma data disponível (<span>{selectedType?.dayLabel}</span>):
          </label>
          <input
            type="text"
            id="date-picker"
            placeholder="Selecione uma data..."
            readOnly
            ref={dateInputRef}
            className="w-full md:w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white cursor-pointer"
          />
          <p className="text-red-500 mt-2">{selectedType && !selectedDate ? '' : ''}</p>
        </div>
        <div id="step-3" className={`${selectedDate ? 'mt-6' : 'hidden'}`}>
          <h3 className="text-lg font-semibold mb-4">3. Preencha seus dados:</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-700">
                CPF/CNPJ
              </label>
              <InputMask
                mask={cpfMask}
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Telefone de Contato
              </label>
              <InputMask
                mask="(99) 9999-9999[9]"
                maskPlaceholder={null}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Endereço (selecione da lista)
              </label>
              <input
                type="text"
                id="address-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite para buscar seu endereço..."
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <select
                id="address"
                required
                value={selectedAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                size={5}
              >
                <option value="">Selecione um endereço</option>
                {filteredAddresses.map((addr) => (
                  <option key={addr.id} value={addr.street}>
                    {addr.street}
                  </option>
                ))}
              </select>
              {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
            </div>
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-slate-700">
                Bairro
              </label>
              <input
                type="text"
                id="bairro"
                value={selectedNeighborhood}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Descrição (ex: 3 sacos de galhos, sofá 2 lugares)
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-all"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-all"
              >
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      </div>
      {loading && (
        <div id="loading-spinner" className="items-center justify-center flex-col text-center p-8 flex">
          <div className="custom-loader" />
          <p className="text-lg font-semibold mt-4">Processando seu agendamento...</p>
        </div>
      )}
    </section>
  );
}
