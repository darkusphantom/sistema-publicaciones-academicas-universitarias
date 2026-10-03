import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LockIcon } from "@/components/ui/icons";
import { formatDate, truncateText, extractKeywords } from "@/lib/format";
import type { Post, PostCategory, PostType, ResearchArea, PostVisibility, AuthorOption } from "@/lib/types";

/** Props accepted by {@link PostCard}. */
export type PostCardProps = {
  post: Post;
  /**
   * Resolved author data. `null` when the `authorId` has no matching user in
   * the repository (broken reference in mock data); the card degrades gracefully
   * by showing only the date.
   */
  author: AuthorOption | null;
};

// ─── Label maps ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<PostCategory, string> = {
  matematicas: "Matemáticas",
  biologia: "Biología",
  quimica: "Química",
  fisica: "Física",
  computacion: "Computación",
  "crecimiento-profesional": "Desarrollo profesional",
};

const TYPE_LABELS: Record<PostType, string> = {
  noticias: "Noticias",
  eventos: "Eventos",
  defensas: "Defensas",
  investigacion: "Investigación",
  convocatorias: "Convocatorias",
  post: "",
  articulo: "",
  ensenanza: ""
};

const AREA_LABELS: Record<ResearchArea, string> = {
  general: "General",
  estadistica: "Estadística",
  probabilidad: "Probabilidad",
  optimizacion: "Optimización",
  "matematicas-aplicadas": "Matemáticas Aplicadas",
  "modelado-matematico": "Modelado Matemático",
  biotecnologia: "Biotecnología",
  bioquimica: "Bioquímica",
  genetica: "Genética",
  microbiologia: "Microbiología",
  ecologia: "Ecología",
  bioinformatica: "Bioinformática",
  "quimica-analitica": "Química Analítica",
  "quimica-organica": "Química Orgánica",
  "quimica-inorganica": "Química Inorgánica",
  fisicoquimica: "Fisicoquímica",
  "quimica-medioambiental": "Química Medioambiental",
  "fisica-computacional": "Física Computacional",
  "fisica-de-materiales": "Física de Materiales",
  astronomia: "Astronomía",
  "fisica-nuclear": "Física Nuclear",
  "mecanica-de-fluidos": "Mecánica de Fluidos",
  "inteligencia-artificial": "Inteligencia Artificial",
  "aprendizaje-automatico": "Aprendizaje Automático",
  "ciencia-de-datos": "Ciencia de Datos",
  "desarrollo-web": "Desarrollo Web",
  "ingenieria-software": "Ingeniería de Software",
  "redes-telecomunicaciones": "Redes y Telecomunicaciones",
  "seguridad-informatica": "Seguridad Informática",
  "sistemas-distribuidos": "Sistemas Distribuidos",
  "bases-de-datos": "Bases de Datos",
  "computacion-grafica": "Computación Gráfica",
  robotica: "Robótica",
  "arquitectura-computadores": "Arquitectura de Computadores",
  "gestion-proyectos": "Gestión de Proyectos",
  liderazgo: "Liderazgo y Gestión de Equipos",
  emprendimiento: "Emprendimiento",
  "comunicacion-profesional": "Comunicación Profesional",
  "etica-profesional": "Ética Profesional",
};

const VISIBILITY_LABELS: Record<PostVisibility, string | null> = {
  publicado: null, // no badge shown for published posts
  borrador: "Borrador",
  oculto: "Oculto",
};

const VISIBILITY_NOTES: Record<PostVisibility, string | null> = {
  publicado: null,
  borrador: "Solo tú ves esta publicación.",
  oculto: "Oculta por un administrador.",
};

/**
 * Editorial post card for the feed.
 *
 * Design spec (`docs/design/wireframes_feed.md` §6.4):
 * - Server Component — no interactivity on the card itself.
 * - The title is the only focusable element: a stretched-link pattern
 *   (`after:absolute after:inset-0`) makes the entire card clickable while
 *   keeping the accessible name on the `<a>` text.
 * - Hover and focus-within both change the border colour so keyboard users
 *   see the same "active card" affordance as pointer users.
 * - Badges never convey state by colour alone (SC 1.4.1); text labels always
 *   accompany any icon.
 * - `line-clamp-3` on the excerpt keeps card heights homogeneous in the grid.
 *
 * @param props - Card props.
 * @returns An `<article>` card element.
 */
export function PostCard({ post, author }: PostCardProps) {
  const visibilityLabel = VISIBILITY_LABELS[post.visibility];
  const visibilityNote = VISIBILITY_NOTES[post.visibility];
  const keywords = extractKeywords(post.content);

  return (
    <article
      className="relative border border-border rounded-lg bg-surface flex flex-col hover:border-primary focus-within:border-primary transition-colors overflow-hidden"
    >
      {post.imageUrl && (
        <div className="w-full aspect-video border-b border-border relative bg-surface-alt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="" className="object-cover w-full h-full" />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* ── Badge row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="category">
            {TYPE_LABELS[post.type]}
          </Badge>

          {keywords.slice(0, 3).map((kw) => (
            <Badge key={kw} tone="neutral">
              {kw}
            </Badge>
          ))}
          {keywords.length > 3 && (
            <Badge tone="neutral">
              +{keywords.length - 3}
            </Badge>
          )}

          {visibilityLabel && (
            <Badge
              tone={post.visibility === "oculto" ? "warning" : "muted"}
              icon={<LockIcon />}
            >
              {visibilityLabel}
            </Badge>
          )}
        </div>

        {/* ── Title (stretched link) ── */}
        <h3 className="font-display text-h3 text-text leading-snug">
          <Link
            href={`/posts/${post.id}`}
            className="after:absolute after:inset-0 focus:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        {/* ── Taxonomy, Author and date ── */}
        <div className="text-sm text-text-muted flex flex-col gap-0.5">
          <p>
            {author
              ? `${author.fullName} · @${author.username} · ${formatDate(post.publishedAt)}`
              : formatDate(post.publishedAt)}
          </p>
          <p>
            {CATEGORY_LABELS[post.category]} · {AREA_LABELS[post.researchArea]}
          </p>
        </div>

        {/* ── Excerpt ── */}
        <p className="text-base text-text-muted line-clamp-3">
          {truncateText(post.content, 180)}
        </p>

        {/* ── Visibility note (borrador / oculto) ── */}
        {visibilityNote && (
          <p className="flex items-center gap-1 text-sm text-text-muted">
            <LockIcon aria-hidden="true" />
            {visibilityNote}
          </p>
        )}
      </div>
    </article>
  );
}
