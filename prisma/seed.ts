import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.$queryRaw`
        -- inserts a row into public.User based on the newly authenticated
        create or replace function public.handle_new_user()
        returns trigger
        language plpgsql
        security definer set search_path = public
        as $$
        begin
        insert into public."User" (id, email, "createdAt", "updatedAt")
        values (new.id, new.email, new.created_at, new.updated_at);
        return new;
        end;
        $$;
    `
    await prisma.$queryRaw`
        -- trigger the function every time a user is created
        create or replace trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();
    `
    await prisma.$queryRaw`
        -- delete authenticated user if public user is deleted
        create or replace function public.handle_deleted_user()
        returns trigger
        language plpgsql
        security definer set search_path = public
        as $$
        begin
        delete from auth.users
        where id = old.id;
        return old;
        end;
        $$;
    `
    await prisma.$queryRaw`
        -- trigger the function every time a public user is deleted
        create or replace trigger on_public_user_deleted
        after delete on public."User"
        for each row execute procedure public.handle_deleted_user();
    `
    const fkResult = await prisma.$queryRaw`SELECT 1 as exists FROM pg_constraint WHERE conname = 'auth_id_fk'` as any[]

    if (!fkResult.length) {
        // create foreign key to auth-table
        await prisma.$queryRaw`
            alter table public."User" add constraint auth_id_fk foreign key (id) references auth.users (id) on delete cascade
        `
    }
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })