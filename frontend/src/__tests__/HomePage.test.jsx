import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

test('renderiza título e botões principais', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
  expect(screen.getByText('Sistema de Agendamento de Recolhas')).toBeInTheDocument();
  expect(screen.getByText('Agendar Nova Recolha')).toBeInTheDocument();
  expect(screen.getByText('Acesso Restrito')).toBeInTheDocument();
});
