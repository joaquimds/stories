export const stripTags = (html = '') => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.innerText.trim().replace(/\s+/g, ' ')
}
