// Datos del imán (spec 10): constantes del efecto y el texto del diálogo científico.
// Los párrafos son paráfrasis en español escritas para este sitio (nunca copias) a
// partir de MAGNET_SOURCES; cada uno cita al menos una fuente. Las citas y las
// referencias siguen APA 7.ª edición y las generan las funciones de `lib/history.ts`
// con la lista de este archivo: no se escriben a mano en el JSX.
import type { HistorySource } from "@/lib/history";

/** Duración total del efecto tras el clic. */
export const MAGNET_DURATION_MS = 10_000;
/** Últimos milisegundos del efecto, en los que se desvanece. */
export const MAGNET_FADE_MS = 2_000;
/** Cuánto se queda el cartel tras el último movimiento del ratón. */
export const MAGNET_LABEL_MS = 1_500;
/** Texto del cartel junto al puntero. */
export const MAGNET_LABEL = "NO PRESIONES EL CLIC IZQUIERDO";

/** "idle" → clic izquierdo → "active" (10 s) → "dialog" → cerrar → "idle". */
export type MagnetState = "idle" | "active" | "dialog";

export const MAGNET_TITLE = "¿POR QUÉ UN IMÁN ESTROPEABA LA TELE?";

export interface MagnetParagraph {
  /** Paráfrasis propia. */
  text: string;
  /** Ids de MAGNET_SOURCES; al menos uno. */
  sources: readonly string[];
}

export const MAGNET_SOURCES: readonly HistorySource[] = [
  {
    id: "umd-k1-12",
    authors: ["University of Maryland Physics Lecture-Demonstration Facility"],
    year: null,
    title: "K1-12 Cathode-ray tube - deflection by magnet",
    container: null,
    url: "https://lecdem.physics.umd.edu/k/k1/928-k1-12.html",
  },
  {
    id: "ucsb-crt-magnet",
    authors: ["Department of Physics, University of California, Santa Barbara"],
    year: null,
    title: "68.33 Cathode ray tube, magnet",
    container: "Physics Lecture Demonstrations",
    url: "https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/68.33.html",
  },
  {
    id: "maglab-deflection",
    authors: ["National High Magnetic Field Laboratory"],
    year: null,
    title: "Cathode ray electromagnetic deflection basics",
    container: "Magnet Academy",
    url: "https://nationalmaglab.org/magnet-academy/watch-play/interactive-tutorials/cathode-ray-electromagnetic-deflection-basics/",
  },
  {
    id: "matsushima-abe-1975",
    authors: ["Matsushima, Y.", "Abe, T."],
    year: 1975,
    title:
      "Degaussing device for colour cathode ray tubes (U.S. Patent No. 3,872,347)",
    container: "U.S. Patent and Trademark Office",
    url: "https://patents.google.com/patent/US3872347A/en",
  },
  {
    id: "wikipedia-degaussing",
    authors: ["Wikipedia"],
    year: null,
    title: "Degaussing",
    container: null,
    url: "https://en.wikipedia.org/wiki/Degaussing",
  },
  {
    id: "wikipedia-crt",
    authors: ["Wikipedia"],
    year: null,
    title: "Cathode-ray tube",
    container: null,
    url: "https://en.wikipedia.org/wiki/Cathode-ray_tube",
  },
];

const ORDER = (s: HistorySource) =>
  s.authors[0].replace(/^The /, "").toLowerCase();

/**
 * Referencias en orden alfabético por primer autor y, a igualdad, por título.
 * También es la lista con la que se decide el sufijo de año (`s.f.-a`, `s.f.-b`):
 * hay dos páginas de Wikipedia sin fecha.
 */
export const SORTED_MAGNET_SOURCES: readonly HistorySource[] = [
  ...MAGNET_SOURCES,
].sort(
  (a, b) =>
    ORDER(a).localeCompare(ORDER(b), "es") ||
    a.title.localeCompare(b.title, "es"),
);

export function getMagnetSource(id: string): HistorySource {
  const source = MAGNET_SOURCES.find((s) => s.id === id);
  if (!source) throw new Error(`Fuente desconocida: ${id}`);
  return source;
}

export const MAGNET_PARAGRAPHS: readonly MagnetParagraph[] = [
  {
    text: "Una tele de tubo, o CRT, es un recipiente de vidrio sin aire. En el fondo, un filamento calienta un cátodo que suelta electrones, y un voltaje los lanza hacia la pantalla, cubierta de fósforo, que se ilumina donde chocan. Unas bobinas desvían ese haz para que recorra la imagen fila a fila, de arriba abajo.",
    sources: ["ucsb-crt-magnet", "wikipedia-crt"],
  },
  {
    text: "Un electrón en movimiento es una carga eléctrica, y un campo magnético empuja a las cargas que se mueven. Es la fuerza de Lorentz: desvía el haz en ángulo recto respecto al campo y a su propia dirección. Por eso, al acercar un imán al tubo, el punto de luz se corre hacia un lado, y si das la vuelta al imán se corre hacia el contrario.",
    sources: ["maglab-deflection", "umd-k1-12", "ucsb-crt-magnet"],
  },
  {
    text: "Las teles en color añaden una lámina metálica con agujeros, la máscara de sombra, que hace que cada haz toque solo el fósforo de su color. Esa lámina es de acero y puede magnetizarse, por ejemplo con un imán o con unos altavoces cerca. Entonces desvía los haces sin querer: la imagen se deforma y se manchan los colores, y las manchas siguen ahí aunque retires el imán, porque el metal conserva el magnetismo.",
    sources: ["wikipedia-degaussing", "matsushima-abe-1975"],
  },
  {
    text: "El remedio es la bobina desmagnetizadora, un aro de cobre o de aluminio alrededor de la pantalla. Se le aplica una corriente alterna que se debilita poco a poco; el campo que crea oscila y se apaga, y deja la máscara casi sin magnetismo. Muchas teles lo hacen solas al encenderse, y ese golpe de corriente es el «clonc» y el temblor de la imagen que se notaban al ponerlas en marcha.",
    sources: ["wikipedia-degaussing", "matsushima-abe-1975"],
  },
  {
    text: "Desde finales de la década de 2000 los tubos fueron sustituidos por pantallas planas, como las LCD, las de plasma y las OLED. Una pantalla plana no dibuja la imagen con un haz de electrones desviado por bobinas, que es justo lo que el imán alteraba, así que lo que acabas de ver ya no ocurre del mismo modo.",
    sources: ["wikipedia-crt"],
  },
];
