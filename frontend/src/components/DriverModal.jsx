import React, { useEffect, useRef, useState } from 'react';

export default function DriverModal({ open, onClose, onConfirm }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setHasFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setHasFile(true);
    } else {
      setHasFile(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Confirmar Recolha</h3>
        <p className="mb-4">Para confirmar que a recolha foi efetuada, por favor, anexe uma foto do local.</p>
        <div className="mb-4">
          <label
            htmlFor="photo-upload"
            className="cursor-pointer bg-slate-100 hover:bg-slate-200 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400 mb-2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-slate-600">Clique para enviar a foto</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && <img src={preview} alt="Pré-visualização" className="mt-4 rounded-lg max-h-40 mx-auto" />}
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(fileInputRef.current?.files?.[0])}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-slate-400"
            disabled={!hasFile}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
