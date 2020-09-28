export const parseThread = (thread) => {
  const [end, ...rest] = (thread || '').split(',')
  const backtrace = rest
    .map((part) => part.split(':'))
    .filter((step) => step.length === 3)
    .map(([from, count, to]) => {
      return {
        from,
        to,
        count: Number(count),
      }
    })
  return { end, backtrace }
}

export const addThreadStep = (thread, from, to) => {
  const newTrace = thread.backtrace.map((p) => {
    if (p.from === from) {
      return { ...p, count: p.count + 1 }
    }
    return p
  })
  newTrace.unshift({ from, to, count: 1 })
  return { ...thread, backtrace: newTrace }
}

export const printThread = (thread) => {
  const trace = thread.backtrace
    .map(({ from, count, to }) => `${from}:${count}:${to}`)
    .join(',')
  return [thread.end, trace].filter(Boolean).join(',')
}
