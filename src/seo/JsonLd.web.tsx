/** Writes a schema.org JSON-LD block into the page. Google reads it from the body as well as the head. */
export const JsonLd = ({ data }: { data: string }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: data }} />
);
