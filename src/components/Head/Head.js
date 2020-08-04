import NHead from 'next/head'

const Head = () => (
  <NHead>
    <title>{process.env.title}</title>
    <link
      href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap"
      rel="stylesheet"
    />
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <meta key="og:title" property="og:title" content={process.env.title} />
    <meta
      key="og:description"
      property="og:description"
      content={process.env.description}
    />
    <meta key="og:image" property="og:image" content={process.env.shareImage} />
    <meta key="og:image:width" property="og:image:width" content="512" />
    <meta key="og:image:height" property="og:image:height" content="512" />
    <meta key="og:type" property="og:type" content="website" />
    <meta key="og:url" property="og:url" content={process.env.siteUrl} />
    <meta
      key="twitter:title"
      name="twitter:title"
      content={process.env.title}
    />
    <meta
      key="twitter:description"
      name="twitter:description"
      content={process.env.description}
    />
    <meta
      key="twitter:image"
      name="twitter:image"
      content={process.env.shareImage}
    />
    <meta key="twitter:card" name="twitter:card" content="summary" />
  </NHead>
)

export default Head
