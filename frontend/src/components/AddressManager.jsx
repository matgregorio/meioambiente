import React, { useState } from 'react';

export default function AddressManager({
  neighborhoods,
  onAddNeighborhood,
  onAddAddress,
  onDeleteNeighborhood,
  onDeleteAddress
}) {
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
  const [streetName, setStreetName] = useState('');

  const handleAddNeighborhood = (event) => {
    event.preventDefault();
    if (!neighborhoodName.trim()) return;
    onAddNeighborhood(neighborhoodName.trim());
    setNeighborhoodName('');
  };

  const handleAddStreet = (event) => {
    event.preventDefault();
    if (!selectedNeighborhoodId || !streetName.trim()) return;
    onAddAddress(selectedNeighborhoodId, streetName.trim());
    setStreetName('');
    setSelectedNeighborhoodId('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Adicionar Novo Bairro</h3>
          <form onSubmit={handleAddNeighborhood} className="flex gap-4">
            <input
              type="text"
              value={neighborhoodName}
              onChange={(e) => setNeighborhoodName(e.target.value)}
              placeholder="Nome do bairro"
              required
              className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Adicionar
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-4">Adicionar Nova Rua</h3>
          <form onSubmit={handleAddStreet} className="space-y-4">
            <select
              value={selectedNeighborhoodId}
              onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
              required
              className="w-full p-2 border bg-white rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione um bairro</option>
              {neighborhoods.map((bairro) => (
                <option key={bairro.id} value={bairro.id}>
                  {bairro.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder="Nome da rua e número"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700"
            >
              Adicionar
            </button>
          </form>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-4">Endereços Cadastrados</h3>
        <div id="address-list-container" className="space-y-4 max-h-96 overflow-y-auto">
          {neighborhoods.map((bairro) => (
            <div key={bairro.id}>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-t-lg">
                <h4 className="font-bold">{bairro.name}</h4>
                <button
                  onClick={() => onDeleteNeighborhood(bairro)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remover Bairro
                </button>
              </div>
              <ul className="pl-4 pr-2 py-2 border rounded-b-lg space-y-1">
                {bairro.streets.map((street) => (
                  <li key={street.id} className="flex justify-between items-center text-sm">
                    <span>{street.name}</span>
                    <button
                      onClick={() => onDeleteAddress(bairro, street)}
                      className="text-xs text-slate-500 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
