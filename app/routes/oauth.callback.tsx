import type { ActionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { authenticator } from '~/auth.server';
import { supabaseClient } from '~/supabase.client';

export const action = async ({ request }: ActionArgs) => {
  await authenticator.authenticate('sb-oauth', request, {
    successRedirect: '/private',
    failureRedirect: '/login'
  });
};

export default function OAuth() {
  const fetcher = useFetcher();

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const formData = new FormData();
        formData.append('session', JSON.stringify(session));

        fetcher.submit(formData, { method: 'post' });
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetcher]);

  return null;
}
