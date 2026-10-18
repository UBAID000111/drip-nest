import React from 'react';

const SITE_URL = 'https://dripnest.site';

interface SeoProps {
  title: string;
  description: string;
  /** Path starting with "/", e.g. "/shop" or "/" for the homepage */
  path: string;
  image?: string;
  noindex?: boolean;
}

/**
 * Per-page SEO tags. React 19 moves these into <head> automatically.
 * Place <Seo ... /> anywhere inside a page's returned JSX.
 */
export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path,
  image,
  noindex = false,
}) => {
  const url = `${SITE_URL}${path}`;
  const desc = description.replace(/\s+/g, ' ').trim().slice(0, 155);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta
        name="robots"
        content={noindex ? 'noindex, follow' : 'index, follow'}
      />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DripNest Decor" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
};
