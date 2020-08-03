import NP from 'nprogress'

class NProgress {
  constructor() {
    this.start = this.start.bind(this)
    this.done = this.done.bind(this)
  }
  start() {
    clearTimeout(this.startTimeout)
    this.startTimeout = setTimeout(() => {
      NP.start()
    }, 50)
  }
  done() {
    clearTimeout(this.startTimeout)
    NP.done()
  }
}

export default NProgress
