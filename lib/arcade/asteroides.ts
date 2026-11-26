// Asteroides (spec 07). Lógica portada de `asteroids(G)` en `references/games.js`;
// el dibujo no: usa la paleta de televisor antiguo (spec 04) en lugar del neón.
// El juego vive entero dentro del canvas y avisa a React con `g.handlers`.
import type { GameFactory } from "./engine";

const INK = "#000000"; // nave, balas y rocas
const FLAME = "#2f3b34"; // crt-line: llama del propulsor
const SCREEN = "#6e8677"; // crt-well: igual que la pantalla de la cabina

// Un lienzo no lee variables CSS, por eso van aquí como constantes.
const STROKE = { ship: 2, flame: 2, large: 3, medium: 2, small: 1.5 } as const;

const TAU = 6.2832;
const LARGE_R = 40;

interface Rock {
  x: number;
  y: number;
  r: number;
  pts: [number, number][];
  vx: number;
  vy: number;
}
interface Ship {
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
}
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  l: number; // vida en segundos
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const ri = (a: number, b: number) => Math.floor(rnd(a, b));

export const asteroides: GameFactory = (g) => {
  const { ctx, W, H, handlers } = g;
  let ship: Ship;
  let rocks: Rock[] = [];
  let bullets: Bullet[] = [];
  let score = 0;
  let lives = 3;
  let level = 1;
  let invulnerable = 0; // segundos de invulnerabilidad que quedan

  const makeRock = (x: number, y: number, r: number): Rock => {
    const n = ri(8, 12);
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      pts.push([
        Math.cos((i / n) * TAU) * r * rnd(0.75, 1.15),
        Math.sin((i / n) * TAU) * r * rnd(0.75, 1.15),
      ]);
    }
    const a = rnd(0, 6.28);
    const speed = rnd(25, 60) * (1 + level * 0.08) * Math.pow(LARGE_R / r, 0.4);
    return { x, y, r, pts, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed };
  };

  const wave = () => {
    rocks = [];
    for (let i = 0; i < 2 + level; i++) {
      let x: number;
      let y: number;
      do {
        x = rnd(0, W);
        y = rnd(0, H);
      } while (Math.hypot(x - W / 2, y - H / 2) < 130);
      rocks.push(makeRock(x, y, LARGE_R));
    }
  };

  const respawn = () => {
    ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 };
    invulnerable = 2.2;
  };

  // Los bordes envuelven: lo que sale por un lado entra por el opuesto.
  const wrap = (o: { x: number; y: number }) => {
    o.x = (o.x + W) % W;
    o.y = (o.y + H) % H;
  };

  wave();
  respawn();
  handlers.score(0);
  handlers.lives(3);
  handlers.level(1);

  return {
    update(dt) {
      const k = g.keys;
      if (k.ArrowLeft) ship.a -= 4.2 * dt;
      if (k.ArrowRight) ship.a += 4.2 * dt;
      if (k.ArrowUp) {
        ship.vx += Math.cos(ship.a) * 260 * dt;
        ship.vy += Math.sin(ship.a) * 260 * dt;
      }
      const friction = Math.pow(0.5, dt);
      ship.vx *= friction;
      ship.vy *= friction;
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      wrap(ship);
      invulnerable -= dt;

      if (g.hit("Space") && bullets.length < 5) {
        bullets.push({
          x: ship.x + Math.cos(ship.a) * 14,
          y: ship.y + Math.sin(ship.a) * 14,
          vx: Math.cos(ship.a) * 520 + ship.vx * 0.3,
          vy: Math.sin(ship.a) * 520 + ship.vy * 0.3,
          l: 0.9,
        });
      }
      for (const b of bullets) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.l -= dt;
        wrap(b);
      }
      bullets = bullets.filter((b) => b.l > 0);
      for (const r of rocks) {
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        wrap(r);
      }

      // Bala contra roca: la roca desaparece y las grandes y medianas se parten.
      for (const b of bullets) {
        for (const r of rocks) {
          if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
            b.l = 0;
            rocks.splice(rocks.indexOf(r), 1);
            score += r.r > 30 ? 20 : r.r > 16 ? 50 : 100;
            handlers.score(score);
            if (r.r > 16) {
              rocks.push(
                makeRock(r.x, r.y, r.r / 2),
                makeRock(r.x, r.y, r.r / 2),
              );
            }
            break;
          }
        }
      }

      // Nave contra roca (solo sin invulnerabilidad).
      if (invulnerable <= 0) {
        for (const r of rocks) {
          if (Math.hypot(ship.x - r.x, ship.y - r.y) < r.r * 0.85 + 7) {
            lives--;
            handlers.lives(lives);
            if (lives <= 0) {
              g.end(score);
              return;
            }
            respawn();
            break;
          }
        }
      }

      if (!rocks.length) {
        level++;
        handlers.level(level);
        wave();
        invulnerable = 1.5;
      }
    },

    draw() {
      ctx.fillStyle = SCREEN;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = INK;
      for (const r of rocks) {
        ctx.lineWidth =
          r.r > 30 ? STROKE.large : r.r > 16 ? STROKE.medium : STROKE.small;
        ctx.beginPath();
        r.pts.forEach((p, i) => {
          if (i) ctx.lineTo(r.x + p[0], r.y + p[1]);
          else ctx.moveTo(r.x + p[0], r.y + p[1]);
        });
        ctx.closePath();
        ctx.stroke();
      }

      // Parpadea mientras es invulnerable.
      if (invulnerable <= 0 || Math.floor(invulnerable * 8) % 2 === 0) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.a);
        ctx.lineWidth = STROKE.ship;
        ctx.strokeStyle = INK;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-10, -9);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, 9);
        ctx.closePath();
        ctx.stroke();
        if (g.keys.ArrowUp) {
          ctx.lineWidth = STROKE.flame;
          ctx.strokeStyle = FLAME;
          ctx.beginPath();
          ctx.moveTo(-8, -4);
          ctx.lineTo(-16 - Math.random() * 6, 0);
          ctx.lineTo(-8, 4);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.fillStyle = INK;
      for (const b of bullets) ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    },
  };
};
