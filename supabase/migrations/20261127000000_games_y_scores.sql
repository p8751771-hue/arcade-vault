-- Spec 11: catálogo de juegos (solo lectura) y puntuaciones.

create table public.games (
  id text primary key,
  title text not null,
  category text not null check (category in ('ARCADE', 'PUZLE', 'DISPAROS', 'LABERINTO')),
  description text not null,
  long_description text not null,
  controls text not null,
  created_at timestamptz not null default now()
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references public.games (id),
  player_name text not null check (char_length(player_name) between 1 and 14),
  score integer not null check (score >= 0 and score <= 99999999),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index scores_game_score_idx on public.scores (game_id, score desc, created_at);
create index scores_score_idx on public.scores (score desc, created_at);
create index scores_user_id_idx on public.scores (user_id);

alter table public.games enable row level security;
alter table public.scores enable row level security;

-- games: solo lectura pública (sin políticas de escritura).
create policy "games_select" on public.games
  for select to anon, authenticated using (true);

-- scores: lectura pública e inserción pública validada. Sin update ni delete.
create policy "scores_select" on public.scores
  for select to anon, authenticated using (true);

create policy "scores_insert" on public.scores
  for insert to anon, authenticated
  with check (user_id is null);

insert into public.games (id, title, category, description, long_description, controls)
values (
  'asteroides',
  'ASTEROIDES',
  'DISPAROS',
  'Pilota tu nave y destruye asteroides en el espacio profundo.',
  'Gira, acelera y dispara en un campo de asteroides sin bordes. Al ser alcanzados, los más grandes se parten en fragmentos más rápidos. Sobrevive a cada oleada con tus tres vidas.',
  '← →: girar · ↑: propulsor · ESPACIO: disparar'
);
