import type { ReactElement } from "react";

/**
 * Renders a JSON-LD structured-data block.
 *
 * `<script type="application/ld+json">` is a non-executable data block, so it is
 * NOT subject to the CSP `script-src` directive and needs no nonce. We still
 * escape "<" to prevent any string field (e.g. a market symbol) from breaking
 * out of the script element.
 */
export function JsonLd({ data }: { data: object | object[] }): ReactElement {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
