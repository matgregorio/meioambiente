import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DriverDashboardPage from '../pages/DriverDashboardPage';

const mockGet = vi.fn(() =>
  Promise.resolve({
    data: [
      {
        protocol: '1',
        type: 'poda',
        date: new Date().toISOString(),
        neighborhoodName: 'Centro',
        addressText: 'Rua Teste, 123',
        requesterName: 'João',
        description: 'Galhos'
      }
    ]
  })
);

vi.mock('../lib/api', () => ({
  default: {
    get: mockGet,
    patch: vi.fn(() => Promise.resolve({})),
    post: vi.fn()
  }
}));

vi.mock('../components/DriverModal', () => ({
  default: () => null
}));

test('exibe cartões de recolha do dia', async () => {
  render(
    <MemoryRouter>
      <DriverDashboardPage />
    </MemoryRouter>
  );
  await waitFor(() => expect(mockGet).toHaveBeenCalled());
  expect(screen.getByText('Rua Teste, 123')).toBeInTheDocument();
  expect(screen.getByText('Confirmar Recolha')).toBeInTheDocument();
});
