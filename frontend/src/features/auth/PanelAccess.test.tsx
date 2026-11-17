import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '@/services/api';
import { isPanelUser } from '@/types/panel';
vi.mock('@/services/api', () => ({ api: { getStoredUser: () => null, getToken: () => 'test-token', getMe: vi.fn(), clearSession: vi.fn(), logout: vi.fn(), setUnauthorizedHandler: vi.fn(), setStoredUser: vi.fn() } }));
function Probe() { const { user, isLoading } = useAuth(); return <div>{isLoading ? 'Loading' : user ? 'Authenticated' : 'Signed out'}</div>; }
describe('panel authentication boundary', () => {
  it('rejects unsupported profile and clears cached user data', async () => {
    vi.mocked(api.getMe).mockResolvedValue({ success: true, message: '', data: { id: 4, username: 'outsider', role: 'member', name: 'Other' } });
    const client = new QueryClient(); client.setQueryData(['assessments', 'me'], { private: true });
    render(<QueryClientProvider client={client}><AuthProvider><Probe /></AuthProvider></QueryClientProvider>);
    expect(await screen.findByText('Signed out')).toBeInTheDocument();
    expect(client.getQueryData(['assessments', 'me'])).toBeUndefined();
  });
  it.each([['dm1','chair',true],['dm2','member',true],['dm3','member',true],['dm1','member',false],['dm4','member',false],['dm2','voter',false]])('validates %s/%s', (username, role, accepted) => {
    expect(isPanelUser({ username, role })).toBe(accepted);
  });
});
