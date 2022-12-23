# remix-kiss - unopinionated remix supabase starter

    Remix K.I.S.S - Keep It Simple Supabase

Warning: this is pretty experimental still, use at your own risk.

A minimalist remix starter to quickly build OAuth2-enabled apps using:

- Remix.run
- Supabase
- Prisma

## Setup

TODO: better descriptions here

### Set up project for development

1. Create or use a [Supabase instance](https://app.supabase.com/projects) and fill in `.env` with values based on the example [.env-file](./.env.example).
1. `npm install`
1. `npx prisma db seed`
1. `npx prisma db push`
1. `npm run dev`

Add new provider (GitHub as example)

1. Create new Githb OAuth App [here](https://github.com/settings/developers)
1. Enable GitHub as provider in Supabase dashboard, using the credentials shown in the GitHub app

## Supabase and Prisma

See [schema.prisma](./prisma/schema.prisma) for Schema. The `User` table is connected to the Supabase `auth.users`.

This is mostly done with the [seed-script](./prisma/seed.ts), which declares triggers and foreign keys outside of the Prisma schema.

Whenever a new user is authenticated through OAuth, a public user is created in the `User` table through postgres triggers.
When a user is deleted in the public `User` table, the corresponding authentication is deleted from the `auth.users` table.