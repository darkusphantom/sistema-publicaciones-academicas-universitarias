/**
 * Extracts unique hashtag keywords from a text string.
 *
 * Rules (spec wireframes_posts.md §6.10):
 * - Word boundary prefix required (no word character before #)
 * - Minimum tag length >= 2 chars (excluding #)
 * - Maximum 12 tags
 * - Deduplicated and lowercase
 *
 * @param content - Text content to extract hashtags from.
 * @returns Array of unique hashtags (e.g. ["#defensa", "#rii"]).
 */
export function extractKeywords(content: string): string[] {
  if (!content) return [];

  // Match #tag starting with word boundary or start of line
  const matches = content.match(/(?:^|\s)(#[a-zA-Z0-9_\u00C0-\u017F]{2,})/g) || [];

  const normalized = matches
    .map((match) => match.trim().toLowerCase())
    .map((tag) => tag.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

  const unique = Array.from(new Set(normalized));
  return unique.slice(0, 12);
}
