export interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  accentColor?: string;
}

/**
 * Institutional slide dataset for the Red FaCyT landing page carousel.
 */
export const LANDING_SLIDES: SlideData[] = [
  {
    id: "welcome",
    badge: "GACETA DIGITAL OFICIAL",
    title: "Red FaCyT: La plataforma de nuestra facultad",
    subtitle:
      "El espacio institucional para comunicar noticias, publicar trabajos científicos, seguir defensas de grado y conectar con la comunidad de la Facultad Experimental de Ciencias y Tecnología.",
    imageSrc: "/images/landing/facyt_hero_gazette.png",
    imageAlt: "Ilustración de la gaceta digital FaCyT con elementos científicos y académicos.",
  },
  {
    id: "news",
    badge: "01. INFORMACIÓN AL INSTANTE",
    title: "Noticias, avisos y comunicados oficiales",
    subtitle:
      "Recibe de primera mano los comunicados decanales, avisos departamentales y boletines de prensa de la facultad sin perderte nada importante.",
    imageSrc: "/images/landing/news_pillar_icon.png",
    imageAlt: "Icono vectorial de noticias y boletines institucionales FaCyT.",
  },
  {
    id: "academic",
    badge: "02. EXCELENCIA CIENTÍFICA",
    title: "Cartelera académica y defensas de grado",
    subtitle:
      "Consulta el cronograma de seminarios, publicaciones de investigación y presentaciones de tesis de estudiantes y profesores.",
    imageSrc: "/images/landing/academic_pillar_icon.png",
    imageAlt: "Icono vectorial de publicaciones académicas y birrete de graduación.",
  },
  {
    id: "campus",
    badge: "03. COMUNIDAD UNIVERSITARIA",
    title: "Un espacio para todos los perfiles",
    subtitle:
      "Diseñado para la colaboración activa entre estudiantes, personal docente, investigadores y la administración de FaCyT.",
    imageSrc: "/images/landing/campus_pillar_icon.png",
    imageAlt: "Icono vectorial de la comunidad y campus universitario.",
  },
];
