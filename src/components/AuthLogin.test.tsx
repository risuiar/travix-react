import { expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import AuthLogin from './AuthLogin';
import { vi } from 'vitest';

// Mock useTranslation para evitar errores de i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock contexto de autenticación si existe (ajusta el path si es necesario)
vi.mock('../contexts/UserAuthProvider', () => ({
  useUserAuth: () => ({ user: null, loading: false, error: null }),
}));
import { MemoryRouter } from 'react-router-dom';

describe('AuthLogin', () => {
  it('renders redirect message', () => {
    render(
      <MemoryRouter>
        <AuthLogin />
      </MemoryRouter>
    );
  expect(screen.getByText('login.redirectingToGoogle')).toBeInTheDocument();
  expect(screen.getByText('login.pleaseWait')).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });

  // Add more tests as needed for successful login, error handling, etc.
});
