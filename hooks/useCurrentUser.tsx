'use client';

import { useSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data: session, status, update } = useSession();

  const updateSession = async () => {
    // Force a hard refresh of the session
    const updated = await update({
      refresh: true,  // This ensures a fresh session is fetched
    });
    return updated?.user ?? null;
  };

  return {
    user: session?.user ?? null,
    loading: status === 'loading',
    authenticated: status === 'authenticated',
    updateSession,
  };
}