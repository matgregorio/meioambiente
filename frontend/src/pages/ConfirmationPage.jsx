import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../lib/api';
import { toast } from 'react-toastify';

const TYPE_NAMES = {
  poda: 'Poda',
  moveis: 'Móveis',
  'vidro-eletronicos': 'Vidro e Eletrônicos'
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ConfirmationPage() {
  const { protocol } = useParams();
  const [schedule, setSchedule] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/verify/${protocol}`);
        setSchedule(data);
      } catch (err) {
        toast.error('Agendamento não encontrado.');
      }
    };
    load();
  }, [protocol]);

  useEffect(() => {
    if (!schedule || !qrRef.current) return;
    const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const text = `${baseUrl}/verify/${schedule.protocol}`;
    QRCode.toCanvas(qrRef.current, text, { width: 180, margin: 1 }).catch(() => {});
  }, [schedule]);

  if (!schedule) {
    return (
      <section className="page active text-center">
        <div className="text-slate-500">Carregando informações...</div>
      </section>
    );
  }

  return (
    <section className="page active text-center">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-green-500 mb-4"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 className="text-3xl font-bold mb-2">Agendamento Confirmado!</h2>
        <p className="text-slate-600 mb-6">Guarde este comprovante. Ele pode ser solicitado pela fiscalização.</p>
        <div className="text-left border-t border-b py-4 mb-6 space-y-2" id="confirmation-details">
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
            <strong>Endereço:</strong> {schedule.addressText}, {schedule.neighborhoodName}
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <canvas ref={qrRef} className="p-2 bg-white border rounded-lg" aria-label="QR Code" />
        </div>
        <p className="text-sm text-slate-500">Aponte a câmera para o QR Code para validar este agendamento.</p>
      </div>
    </section>
  );
}
