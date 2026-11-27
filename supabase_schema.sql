-- Im Supabase SQL Editor komplett ausführen.
create extension if not exists pgcrypto;

create table if not exists public.properties (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 address text,
 notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.units (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 property_id uuid not null references public.properties(id) on delete cascade,
 name text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.tenants (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 unit_id uuid not null references public.units(id) on delete cascade,
 name text not null,
 email text,
 phone text,
 start_date date,
 created_at timestamptz not null default now()
);
create table if not exists public.transactions (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 property_id uuid references public.properties(id) on delete set null,
 kind text not null check (kind in ('income','expense')),
 description text not null,
 amount numeric(12,2) not null check (amount > 0),
 date date not null,
 created_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.transactions enable row level security;

-- WICHTIG: Für zwei Nutzer mit gemeinsamem Datenbestand müssen beide Konten
-- derselben Freigabegruppe zugeordnet werden. Diese erste Version nutzt
-- absichtlich eine gemeinsame owner_id: Lege beide Benutzerkonten an und
-- setze nach dem ersten Login die UUID des ersten Benutzers als owner_id
-- für beide Benutzer in einer späteren Team-/Mitglieder-Erweiterung.
-- Aktuell ist der Datenbestand pro Benutzer privat. Nicht die zweite Person
-- mit dem ersten Passwort anmelden lassen.

create policy "own properties" on public.properties for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "own units" on public.units for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "own tenants" on public.tenants for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "own transactions" on public.transactions for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());

-- Automatisch owner_id setzen
create or replace function public.set_owner_id() returns trigger language plpgsql security invoker as $$
begin new.owner_id := auth.uid(); return new; end; $$;
drop trigger if exists properties_owner on public.properties;
create trigger properties_owner before insert on public.properties for each row execute function public.set_owner_id();
drop trigger if exists units_owner on public.units;
create trigger units_owner before insert on public.units for each row execute function public.set_owner_id();
drop trigger if exists tenants_owner on public.tenants;
create trigger tenants_owner before insert on public.tenants for each row execute function public.set_owner_id();
drop trigger if exists transactions_owner on public.transactions;
create trigger transactions_owner before insert on public.transactions for each row execute function public.set_owner_id();
