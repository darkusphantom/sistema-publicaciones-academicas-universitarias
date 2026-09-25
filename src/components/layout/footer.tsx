/** Props of {@link Footer}. */
export type FooterProps = {
  /**
   * Year shown in the legal line. Defaults to the current year, resolved on the
   * server, so the page can still be statically rendered.
   */
  year?: number;
};

/**
 * Institutional footer shared by the public screens.
 *
 * Closes the document with the `contentinfo` landmark required by
 * `docs/design/accessibility.md` §3, stating the institution and the ownership
 * of the publication.
 *
 * @param props - Footer props.
 * @returns The footer element.
 */
export function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-8 sm:px-8">
        <p className="font-display text-h3 text-primary">Red FaCyT</p>
        <p className="text-sm text-text-muted">
          Facultad Experimental de Ciencias y Tecnología
        </p>
        <p className="text-sm text-text-muted">© {year} Red FaCyT</p>
      </div>
    </footer>
  );
}
