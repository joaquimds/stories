export const parseThread = (thread) => {
  return (thread || '')
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

export const addThreadStep = (thread = [], from, to) => {
  const newThread = thread.map((p) => {
    if (p.from === from) {
      return { ...p, count: p.count + 1 }
    }
    return p
  })
  newThread.push({ from, to, count: 1 })
  return newThread
}

export const printThread = (thread = []) => {
  return thread.map(({ from, count, to }) => `${from}:${count}:${to}`).join(',')
}
