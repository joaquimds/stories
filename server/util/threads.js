export const parseThread = (thread) => {
  const [end, ...rest] = (thread || '').split(',')
  const backtrace = rest
    .map((part) => part.split(':'))
    .filter((step) => step.length === 2)
    .map(([from, to]) => {
      return {
        from,
        to,
      }
    })
  return { end, backtrace }
}

export const addThreadStep = (thread, from, to, defaultParent = null) => {
  let backtrace = [...thread.backtrace]
  if (defaultParent !== to) {
    backtrace.unshift({ from, to })
  }
  return { end: from, backtrace }
}

export const printThread = (thread) => {
  const trace = thread.backtrace
    .map(({ from, to }) => `${from}:${to}`)
    .join(',')
  return [thread.end, trace].filter(Boolean).join(',')
}
