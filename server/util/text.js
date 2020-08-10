export const slugify = (content) => {
  return encodeURIComponent(content.trim().replace(/\s+/g, '_'))
}

export const unslugify = (slug) => {
  return decodeURIComponent(slug).replace(/_+/g, ' ')
}
