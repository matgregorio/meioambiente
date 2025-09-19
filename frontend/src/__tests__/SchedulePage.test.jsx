import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchedulePage from '../pages/SchedulePage';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.startsWith('/public/addresses')) {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith('/schedules/availability')) {
        return Promise.resolve({ data: { unavailableDates: [] } });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: { protocol: '123' } }))
  }
}));

vi.mock('flatpickr', () => {
  return vi.fn(() => ({
    destroy: vi.fn(),
    open: vi.fn()
  }));
});

test('mostra passo de data após selecionar tipo', async () => {
  render(
    <MemoryRouter>
      <SchedulePage />
    </MemoryRouter>
  );
  const button = screen.getByText('Poda');
  fireEvent.click(button);
  expect(screen.getByText('2. Escolha uma data disponível (Terça-feira):')).toBeInTheDocument();
});
