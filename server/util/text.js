export const slugify = (name) => {
  return encodeURIComponent(name.trim().replace(/\s+/g, '_'))
}

export const unslugify = (slug) => {
  return decodeURIComponent(slug).replace(/_+/g, ' ')
}
