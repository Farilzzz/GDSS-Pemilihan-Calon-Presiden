import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { VotingResultsPage } from './VotingResultsPage';
import { DecisionHistoryPage } from './DecisionHistoryPage';
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
const evaluation = { status: 'waiting', is_completed: false, total_votes_cast: 1, required_votes: 3, winner: null, tallies: [] };
vi.mock('@/services/api', () => ({ api: {
  getVotingResults: async () => ({ success: true, data: { round_number: 1, round_status: 'completed', results: { ...evaluation, status: 'majority', is_completed: true, total_votes_cast: 3, required_votes: undefined, winner: { candidate_id: 2, candidate_name: 'API Winner', votes: 2, percentage: 66.67 } } } }),
  getDecisionsHistory: async () => ({ success: true, data: { session_id: 1, final_decision: null, rounds: [{ id: 1, round_number: 1, status: 'open', opened_at: '2026-01-01', closed_at: null, opened_by_name: 'dm1', evaluation }] } }),
} }));
function show(element: React.ReactNode) { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter>{element}</MemoryRouter></QueryClientProvider>); }
describe('PHP result contract', () => {
  it('renders completed round without required_votes and uses API winner', async () => {
    show(<VotingResultsPage />);
    expect(await screen.findByText('3/3 suara terkumpul')).toBeInTheDocument();
    expect(screen.getByText('API Winner')).toBeInTheDocument();
  });
  it('history uses fixed panel denominator for incomplete rounds', async () => {
    show(<DecisionHistoryPage />);
    expect(await screen.findByText('1 dari 3')).toBeInTheDocument();
  });
});
