import type { Post } from "@/lib/types";

/**
 * Static mock post dataset for the frontend phase.
 *
 * Distribution (docs/design/wireframes_feed.md §4.6):
 * - 6 `publicado` from different authors
 * - 2 `borrador` from the default session user (u-3 / m.rivas)
 * - 1 `publicado` from the session user themselves (for profile content)
 * - 1 `oculto` from another author (tests admin scope)
 * - 2 posts with `publishedAt` inside/outside the March 2026 range
 *
 * At least one `publishedAt` has a non-midnight time so that DESC ordering by
 * time (not only by date) can be verified in tests.
 *
 * Authors reference `src/data/users.ts`:
 * - u-1: Administrador Sistema (admin)
 * - u-2: Juan Pérez (profesor)
 * - u-3: María Rivas (estudiante — default session user)
 * - u-4: Carlos Torres (estudiante)
 * - u-5: Luisa Gómez (estudiante)
 */
export const mockPosts: Post[] = [
  // ── publicado ──────────────────────────────────────────────────────────────
  {
    id: "post-1",
    title: "Cartelera de defensas de grado de marzo 2026",
    content:
      "El cronograma de defensas de grado para el mes de marzo de 2026 ya está disponible. Los estudiantes que presenten sus proyectos deben confirmar su asistencia con 48 horas de anticipación ante la coordinación de la facultad.",
    authorId: "u-3",
    category: "defensas",
    type: "articulo",
    visibility: "publicado",
    publishedAt: "2026-03-12T10:30:00Z",
    createdAt: "2026-03-11T08:00:00Z",
    updatedAt: "2026-03-12T10:30:00Z",
    imageUrl: null,
  },
  {
    id: "post-2",
    title: "Talleres de desarrollo de software libre – Ciclo 2026",
    content:
      "La facultad abre su ciclo anual de talleres de desarrollo de software libre. Este año se incluyen sesiones sobre sistemas operativos GNU/Linux, herramientas de control de versiones y buenas prácticas de seguridad en aplicaciones web.",
    authorId: "u-2",
    category: "eventos",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-03-11T09:00:00Z",
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-03-11T09:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-3",
    title: "Resultados del concurso de investigación estudiantil",
    content:
      "Se publicaron los resultados del primer concurso de investigación estudiantil de la facultad. Felicitamos a los equipos ganadores y agradecemos la participación de todos los estudiantes que presentaron sus proyectos.",
    authorId: "u-4",
    category: "investigacion",
    type: "articulo",
    visibility: "publicado",
    publishedAt: "2026-03-08T14:00:00Z",
    createdAt: "2026-03-07T10:00:00Z",
    updatedAt: "2026-03-08T14:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-4",
    title: "Aviso: actualización del calendario académico 2026",
    content:
      "La coordinación informa que el calendario académico del período 2026-I ha sido actualizado. Los períodos de inscripción y las fechas de exámenes finales han sido modificados. Consulten el documento oficial en la cartelera de la facultad.",
    authorId: "u-1",
    category: "noticias",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-03-05T08:00:00Z",
    createdAt: "2026-03-04T12:00:00Z",
    updatedAt: "2026-03-05T08:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-5",
    title: "Notas del seminario: Inteligencia Artificial en la academia",
    content:
      "Compartimos las notas y materiales del seminario sobre el uso de inteligencia artificial en la investigación académica que tuvo lugar el pasado 2 de marzo. Los slides están disponibles para descarga en el portal de la facultad.",
    authorId: "u-5",
    category: "noticias",
    type: "ensenanza",
    visibility: "publicado",
    publishedAt: "2026-03-04T16:00:00Z",
    createdAt: "2026-03-03T09:00:00Z",
    updatedAt: "2026-03-04T16:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-6",
    title: "Plan de estudios actualizado: Ingeniería en Sistemas",
    content:
      "La facultad aprobó la actualización del plan de estudios de la carrera de Ingeniería en Sistemas. Los cambios aplican a partir del período 2026-II e incluyen nuevas asignaturas de desarrollo cloud y seguridad informática.",
    authorId: "u-2",
    category: "noticias",
    type: "articulo",
    visibility: "publicado",
    publishedAt: "2026-02-20T11:00:00Z",
    createdAt: "2026-02-19T09:00:00Z",
    updatedAt: "2026-02-20T11:00:00Z",
    imageUrl: null,
  },
  // ── borrador (m.rivas / u-3 — default session user) ───────────────────────
  {
    id: "post-7",
    title: "Quédate con el otro lado: reflexiones sobre el aprendizaje autónomo",
    content:
      "Este es un borrador de artículo sobre el aprendizaje autónomo y la importancia de cultivar la curiosidad intelectual fuera del aula. Todavía está en proceso de revisión antes de publicarse.",
    authorId: "u-3",
    category: "noticias",
    type: "post",
    visibility: "borrador",
    publishedAt: "2026-03-10T07:00:00Z",
    createdAt: "2026-03-09T18:00:00Z",
    updatedAt: "2026-03-10T07:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-8",
    title: "Resumen de metodologías ágiles en proyectos académicos (borrador)",
    content:
      "Borrador de resumen sobre el uso de metodologías ágiles como Scrum y Kanban adaptadas al contexto de proyectos académicos universitarios. Pendiente de revisión con la tutora.",
    authorId: "u-3",
    category: "investigacion",
    type: "ensenanza",
    visibility: "borrador",
    publishedAt: "2026-03-06T20:00:00Z",
    createdAt: "2026-03-05T15:00:00Z",
    updatedAt: "2026-03-06T20:00:00Z",
    imageUrl: null,
  },
  // ── publicado (m.rivas / u-3) — for profile view ─────────────────────────
  {
    id: "post-9",
    title: "Convocatoria de beca de investigación 2026",
    content:
      "La facultad convoca a los estudiantes a participar en el programa de becas de investigación 2026. Los interesados deben presentar su propuesta de proyecto antes del 30 de marzo. Los requisitos completos están disponibles en secretaría.",
    authorId: "u-3",
    category: "convocatorias",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-02-15T10:00:00Z",
    createdAt: "2026-02-14T09:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
    imageUrl: null,
  },
  // ── oculto (u-2) — tests admin visibility scope ───────────────────────────
  {
    id: "post-10",
    title: "Convocatoria de beca 2026 – versión revisada",
    content:
      "Esta publicación fue ocultada por un administrador pendiente de revisión de contenido. Contiene información sobre las bases de la convocatoria de becas 2026 que está siendo actualizada.",
    authorId: "u-2",
    category: "convocatorias",
    type: "post",
    visibility: "oculto",
    publishedAt: "2026-02-02T08:00:00Z",
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-02T08:00:00Z",
    imageUrl: null,
  },
  // ── additional posts: inside/outside March 2026 range ────────────────────
  {
    id: "post-11",
    title: "Inauguración del laboratorio de cómputo renovado",
    content:
      "El laboratorio de cómputo de la facultad fue completamente renovado gracias al programa de inversión en infraestructura 2025. El espacio cuenta ahora con 40 equipos de última generación disponibles para los estudiantes.",
    authorId: "u-4",
    category: "noticias",
    type: "post",
    visibility: "publicado",
    publishedAt: "2026-04-01T09:00:00Z",
    createdAt: "2026-03-31T16:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    imageUrl: null,
  },
  {
    id: "post-12",
    title: "Jornada de bienvenida para estudiantes de nuevo ingreso 2026",
    content:
      "La facultad organizó una jornada de bienvenida para los estudiantes de nuevo ingreso del período 2026-I. El evento incluyó presentaciones de los departamentos, visitas guiadas y una sesión de preguntas y respuestas con el cuerpo docente.",
    authorId: "u-5",
    category: "eventos",
    type: "articulo",
    visibility: "publicado",
    publishedAt: "2026-01-20T10:00:00Z",
    createdAt: "2026-01-19T14:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
    imageUrl: null,
  },
];
