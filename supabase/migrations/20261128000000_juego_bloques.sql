-- Spec 12: BLOQUES, segundo juego jugable. Solo una fila nueva en `games`; el
-- esquema y las políticas no cambian.

insert into public.games (id, title, category, description, long_description, controls)
values (
  'bloques',
  'BLOQUES',
  'PUZLE',
  'Encaja las piezas y completa líneas antes de llegar arriba.',
  'Las piezas caen sin parar: gíralas, muévelas y encájalas para completar líneas. Cuantas más líneas borres a la vez, más puntos consigues. Cada diez líneas la caída se acelera.',
  '← →: mover · ↑ / D: girar · A: girar al revés · ↓: bajar rápido · ESPACIO: caída instantánea'
);
