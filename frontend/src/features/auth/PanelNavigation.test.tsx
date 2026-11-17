import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { App } from '@/app/App';
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false, login: vi.fn() }), AuthProvider: ({ children }: { children: React.ReactNode }) => children }));
describe('closed panel navigation', () => {
 it('does not offer public registration', () => {
   render(<MemoryRouter><LoginPage /></MemoryRouter>);
   expect(screen.queryByRole('link', { name: /Daftar sebagai pemilih/i })).not.toBeInTheDocument();
 });
 it('redirects dormant registration route to login', async () => {
   window.history.replaceState({}, '', '/register');
   render(<App />);
   expect(await screen.findByText('Masuk Ke Aplikasi')).toBeInTheDocument();
   expect(window.location.pathname).toBe('/login');
 });
});
