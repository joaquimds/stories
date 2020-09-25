export const parsePath = (path) => {
  return (path || '')
    .split(',')
    .map((part) => part.split(':'))
    .filter((step) => step.length === 3)
    .map(([from, count, to]) => {
      return {
        from,
        to,
        count: Number(count),
      }
    })
}

export const addPathStep = (path = [], from, to) => {
  const newPath = path.map((p) => {
    if (p.from === from) {
      return { ...p, count: p.count + 1 }
    }
    return p
  })
  newPath.push({ from, to, count: 1 })
  return newPath
}

export const printPath = (path = []) => {
  return path.map(({ from, count, to }) => `${from}:${count}:${to}`).join(',')
}
