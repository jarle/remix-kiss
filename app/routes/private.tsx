import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { authenticator, oAuthStrategy } from '~/auth/auth.server';
import { db } from '~/db.server';

export const action = async ({ request }: ActionArgs) => {
  await authenticator.logout(request, { redirectTo: '/login' });
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await oAuthStrategy.checkSession(request, {
    failureRedirect: '/login'
  });

  invariant(session.user, "User should be set for oAuth-session")

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) {
    throw new Response(
      `Authenticated user returned from session (${session.user.id}) did not match any users in the public.User table. Make sure that the trigger functions for the database are registered with the seed script.`,
      {
        status: 500,
        statusText: "Database error"
      })
  }

  return json({ user });
};

export default function Screen() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Hello {user.email}</h1>

      <Form method="post">
        <button>Log Out</button>
      </Form>
    </>
  );
}
