// Datos de la página "Historia" (spec 05). Los textos de los hitos son paráfrasis en
// español escritas para este sitio a partir de las fuentes de HISTORY_SOURCES (nunca
// copias), y cada hito cita al menos dos. Citas y referencias siguen APA 7.ª edición y
// las generan formatApaCitation / formatApaReference: no se escriben a mano en el JSX.

/** Referencia en formato APA 7.ª edición (página web). */
export interface HistorySource {
  id: string;
  /** Personas ("Spicer, D.") u organización ("The Strong National Museum of Play"). */
  authors: readonly string[];
  /** null → "s.f." (sin fecha). */
  year: number | null;
  title: string;
  /** Sitio web o publicación; null si coincide con el autor. */
  container: string | null;
  url: string;
}

export interface Milestone {
  year: number;
  title: string;
  /** null en 1982 (no es una máquina). */
  maker: string | null;
  /** Diseñadores verificados en las fuentes; [] en 1982. */
  creators: readonly string[];
  /** 2–3 frases parafraseadas, sin adjetivos de marketing. */
  text: string;
  /** ≥ 2 ids de HISTORY_SOURCES. */
  sources: readonly string[];
}

const STRONG = "The Strong National Museum of Play";
const WVGHOF = "World Video Game Hall of Fame";
const ZKM = "ZKM | Center for Art and Media Karlsruhe";

export const HISTORY_SOURCES: readonly HistorySource[] = [
  {
    id: "chm-computer-space",
    authors: ["Computer History Museum"],
    year: null,
    title: "Computer Space video game",
    container: "CHM Revolution",
    url: "https://www.computerhistory.org/revolution/computer-games/16/210/874",
  },
  {
    id: "norman-computer-space",
    authors: ["Norman, J. M."],
    year: null,
    title: "“Computer Space,” the first commercially sold coin-operated video game",
    container: "History of Information",
    url: "https://www.historyofinformation.com/detail.php?id=2325",
  },
  {
    id: "strong-computer-space",
    authors: [STRONG],
    year: 2023,
    title: "Computer Space",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/computer-space/",
  },
  {
    id: "strong-pong",
    authors: [STRONG],
    year: 2021,
    title: "Pong",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/pong/",
  },
  {
    id: "spicer-pong",
    authors: ["Spicer, D."],
    year: 2022,
    title: "50 years of fun with Pong",
    container: "Computer History Museum",
    url: "https://computerhistory.org/blog/50-years-of-fun-with-pong/",
  },
  {
    id: "marsh-pong",
    authors: ["Marsh, A."],
    year: 2022,
    title: "Pong was boring—and people loved it",
    container: "IEEE Spectrum",
    url: "https://spectrum.ieee.org/pong-video-game",
  },
  {
    id: "gwr-gun-fight",
    authors: ["Guinness World Records"],
    year: 2016,
    title: "First arcade game to use a microprocessor",
    container: null,
    url: "https://www.guinnessworldrecords.com/world-records/98521-first-arcade-game-to-use-a-microprocessor",
  },
  {
    id: "franklin-gun-fight",
    authors: ["The Franklin Institute"],
    year: 2018,
    title: "From transistors to microprocessors: This classic arcade game was the first and last of a generation",
    container: null,
    url: "https://fi.edu/en/blog/transistors-microprocessors-classic-arcade-game-was-first-and-last-generation",
  },
  {
    id: "smith-space-invaders",
    authors: ["Smith, T."],
    year: 2013,
    title: "Thirty-five years ago today: Space Invaders conquer the Earth",
    container: "The Register",
    url: "https://www.theregister.com/2013/06/05/feature_space_invaders_at_35/",
  },
  {
    id: "strong-space-invaders",
    authors: [STRONG],
    year: 2021,
    title: "Space Invaders",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/space-invaders/",
  },
  {
    id: "gamesbeat-nishikado",
    authors: ["GamesBeat"],
    year: 2024,
    title: "How Tomohiro Nishikado created Space Invaders 46 years ago",
    container: null,
    url: "https://gamesbeat.com/how-tomohiro-nishikado-created-space-invaders-46-years-ago-exclusive-interview/",
  },
  {
    id: "strong-asteroids",
    authors: [STRONG],
    year: 2024,
    title: "Asteroids",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/asteroids/",
  },
  {
    id: "zkm-asteroids",
    authors: [ZKM],
    year: null,
    title: "Asteroids",
    container: null,
    url: "https://zkm.de/en/asteroids",
  },
  {
    id: "strong-pac-man",
    authors: [STRONG],
    year: 2021,
    title: "Pac-Man",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/pac-man/",
  },
  {
    id: "thompson-pac-man",
    authors: ["Thompson, H."],
    year: 2015,
    title: "Pac-Man turns 35 this month",
    container: "Smithsonian Magazine",
    url: "https://www.smithsonianmag.com/smart-news/pac-man-turns-35-month-180955401/",
  },
  {
    id: "strong-donkey-kong",
    authors: [STRONG],
    year: 2021,
    title: "Donkey Kong",
    container: WVGHOF,
    url: "https://www.museumofplay.org/games/donkey-kong/",
  },
  {
    id: "zkm-donkey-kong",
    authors: [ZKM],
    year: null,
    title: "Donkey Kong",
    container: null,
    url: "https://zkm.de/en/node/3281",
  },
  {
    id: "wheeler-crash",
    authors: ["Wheeler, E."],
    year: 2011,
    title: "What video game crash?",
    container: STRONG,
    url: "https://www.museumofplay.org/blog/what-video-game-crash/",
  },
  {
    id: "saucier-arcade",
    authors: ["Saucier, J."],
    year: 2013,
    title: "Coin-op century: History of the arcade",
    container: STRONG,
    url: "https://www.museumofplay.org/blog/coin-op-century-a-brief-history-of-the-american-arcade/",
  },
];

export const MILESTONES: readonly Milestone[] = [
  {
    year: 1971,
    title: "COMPUTER SPACE",
    maker: "Nutting Associates",
    creators: ["Nolan Bushnell", "Ted Dabney"],
    text: "Dos ingenieros sacaron de los ordenadores universitarios la idea de Spacewar!, un duelo de naves, y la metieron en una máquina de monedas. Nutting Associates la fabricó en un mueble de fibra de vidrio con aire de ciencia ficción: fue la primera recreativa de vídeo que se puso a la venta. Vendió poco, pero demostró que la gente pagaría por jugar.",
    sources: ["strong-computer-space", "chm-computer-space", "norman-computer-space"],
  },
  {
    year: 1972,
    title: "PONG",
    maker: "Atari",
    creators: ["Allan Alcorn", "Nolan Bushnell"],
    text: "Bushnell le pidió a Allan Alcorn, recién contratado, un tenis de mesa para la televisión como ejercicio de práctica. El prototipo se colocó en un bar de Sunnyvale y a los pocos días dejó de funcionar: la caja estaba tan llena de monedas que no cabía ninguna más. Fue el primer videojuego que conquistó al gran público y puso a Atari al frente de la industria.",
    sources: ["strong-pong", "spicer-pong", "marsh-pong"],
  },
  {
    year: 1975,
    title: "GUN FIGHT",
    maker: "Midway",
    creators: ["Tomohiro Nishikado", "Dave Nutting"],
    text: "Dos vaqueros se baten en duelo entre cactus y diligencias. Tomohiro Nishikado lo diseñó para Taito como Western Gun, con circuitos lógicos sencillos, y para venderlo en Estados Unidos Midway lo rehízo alrededor de un microprocesador Intel 8080. Así se convirtió en la primera recreativa con microprocesador, el mismo chip que poco después movería Space Invaders.",
    sources: ["gwr-gun-fight", "franklin-gun-fight", "smith-space-invaders"],
  },
  {
    year: 1978,
    title: "SPACE INVADERS",
    maker: "Taito",
    creators: ["Tomohiro Nishikado"],
    text: "Un cañón láser defiende la Tierra de filas de alienígenas que bajan sin descanso. Nishikado se encargó él solo del juego y de su placa, y tardó cerca de año y medio. La puntuación más alta quedaba a la vista en lo alto de la pantalla, y superarla pasó a ser el reto de todos los salones.",
    sources: ["strong-space-invaders", "gamesbeat-nishikado", "smith-space-invaders"],
  },
  {
    year: 1979,
    title: "ASTEROIDS",
    maker: "Atari",
    creators: ["Lyle Rains", "Ed Logg"],
    text: "Una nave triangular flota entre rocas que, con cada disparo, se parten en trozos más pequeños y veloces. Su monitor vectorial dibujaba líneas brillantes con un haz de electrones, muy distintas de los píxeles de la época. Fue de los primeros juegos que dejaban escribir tres iniciales en la tabla de récords y el más vendido de Atari en los salones.",
    sources: ["strong-asteroids", "zkm-asteroids"],
  },
  {
    year: 1980,
    title: "PAC-MAN",
    maker: "Namco",
    creators: ["Toru Iwatani"],
    text: "En vez de disparar, el protagonista come: su nombre viene de «paku-paku», la palabra japonesa que imita el sonido de masticar. Toru Iwatani quería atraer también a quienes no pisaban los salones, y lo logró con un héroe redondo y cuatro fantasmas con carácter. Se convirtió en la recreativa más vendida de la historia y en el primer personaje de videojuego conocido por todos.",
    sources: ["strong-pac-man", "thompson-pac-man"],
  },
  {
    year: 1981,
    title: "DONKEY KONG",
    maker: "Nintendo",
    creators: ["Shigeru Miyamoto"],
    text: "Nintendo necesitaba con urgencia un éxito en Norteamérica y se lo encargó a un empleado novato, Shigeru Miyamoto. El resultado fue la primera recreativa que contaba una historia: un gorila rapta a una chica y un héroe llamado Jumpman salta barriles y sube escaleras para rescatarla. Aquel saltarín acabaría llamándose Mario, y el juego dio forma al género de plataformas.",
    sources: ["strong-donkey-kong", "zkm-donkey-kong"],
  },
  {
    year: 1982,
    title: "LA EDAD DE ORO",
    maker: null,
    creators: [],
    text: "A comienzos de los ochenta los salones recreativos vivieron su mejor época: paredes enmoquetadas, luz negra y filas de muebles iluminados. Aquel auge terminó con la caída del mercado de 1983, cuando el exceso de juegos y la competencia de consolas y ordenadores domésticos vaciaron muchos locales. Arcade Vault quiere recuperar la pantalla de aquellos años.",
    sources: ["saucier-arcade", "wheeler-crash"],
  },
];

/** Párrafos de "POR QUÉ PARECEMOS UN TELEVISOR". */
export const STYLE_NOTE: readonly string[] = [
  "Las primeras recreativas no tenían pantallas planas: usaban tubos de rayos catódicos, el mismo televisor de casa metido en un mueble de madera o de fibra de vidrio. Un haz de electrones recorría la pantalla de arriba abajo, línea a línea, y hacía brillar el fósforo del cristal.",
  "Por eso Arcade Vault se ve así. El fondo verde-gris imita una pantalla de fósforo apagada, las líneas finas son el rastro de aquel barrido y la franja clara que baja es el refresco de la imagen. El texto es negro para que se lea bien sobre ese fondo.",
  "El primer diseño del sitio era neón sobre negro, inspirado en los rótulos de los salones. En noviembre de 2026 lo cambiamos para que la página se pareciera más a las máquinas que recuerda. Estas dos capturas comparan los dos estilos.",
];

const ORDER = (s: HistorySource) => s.authors[0].replace(/^The /, "").toLowerCase();

/** Fuentes en orden alfabético por primer autor (sin "The") y, a igualdad, por título. */
export const SORTED_SOURCES: readonly HistorySource[] = [...HISTORY_SOURCES].sort(
  (a, b) => ORDER(a).localeCompare(ORDER(b), "es") || a.title.localeCompare(b.title, "es"),
);

/** "2021a", "s.f.-b"…: APA añade una letra cuando un autor tiene varias obras del mismo año. */
function apaYear(source: HistorySource): string {
  const base = source.year === null ? "s.f." : String(source.year);
  const same = SORTED_SOURCES.filter(
    (s) => s.authors.join("|") === source.authors.join("|") && s.year === source.year,
  );
  if (same.length < 2) return base;
  const letter = String.fromCharCode(97 + same.findIndex((s) => s.id === source.id));
  return source.year === null ? `${base}-${letter}` : `${base}${letter}`;
}

/** Apellido o nombre de organización para la cita en el texto. */
function citeName(author: string): string {
  return author.includes(", ") ? author.split(", ")[0] : author;
}

/** "(Smith, 2013)": cita en el texto, sin paréntesis (los pone quien agrupa). */
export function formatApaCitation(source: HistorySource): string {
  const names = source.authors.map(citeName);
  const who =
    names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} y ${names[1]}` : `${names[0]} et al.`;
  return `${who}, ${apaYear(source)}`;
}

export interface ApaReferenceParts {
  authors: string;
  year: string;
  title: string;
  container: string | null;
  url: string;
}

/** Partes de la referencia APA; el título va en cursiva al renderizar. */
export function formatApaReference(source: HistorySource): ApaReferenceParts {
  const authors =
    source.authors.length === 1
      ? source.authors[0]
      : `${source.authors.slice(0, -1).join(", ")} y ${source.authors.at(-1)}`;
  return {
    authors: authors.endsWith(".") ? authors : `${authors}.`,
    year: `(${apaYear(source)}).`,
    // APA: el título termina en punto salvo que ya acabe en "?" o "!".
    title: /[?!.]$/.test(source.title) ? source.title : `${source.title}.`,
    container: source.container ? `${source.container}.` : null,
    url: source.url,
  };
}

export function getSource(id: string): HistorySource {
  const s = HISTORY_SOURCES.find((x) => x.id === id);
  if (!s) throw new Error(`Fuente desconocida: ${id}`);
  return s;
}
