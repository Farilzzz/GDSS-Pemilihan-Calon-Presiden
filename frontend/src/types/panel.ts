import type { User } from './index';

// Fixed deployment contract: dm1 chairs, dm2/dm3 are members.
// Display metadata only; outcomes, tallies and winners always come from PHP.
export const PANEL_SIZE = 3;
export const MAJORITY_VOTES = 2;
export function isPanelUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') return false;
  const value = user as Partial<User>;
  return (value.username === 'dm1' && value.role === 'chair') ||
    ((value.username === 'dm2' || value.username === 'dm3') && value.role === 'member');
}
