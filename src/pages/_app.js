import '../styles.scss'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'

let prevPath = null
const progressStart = (as) => {
  const [path, query] = as.split('?')
  if (query && path === prevPath) {
    return
  }
  NProgress.start()
}
const progressDone = (as) => {
  ;[prevPath] = as.split('?')
  NProgress.done()
}

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
    Router.events.on('routeChangeStart', progressStart)
    Router.events.on('routeChangeComplete', progressDone)
    Router.events.on('routeChangeError', progressDone)
    return () => {
      Router.events.off('routeChangeStart', progressStart)
      Router.events.off('routeChangeComplete', progressDone)
      Router.events.off('routeChangeError', progressDone)
    }
  }, [])

  const router = useRouter()

  return (
    <div className={`root root--${router.asPath}`}>
      <Head>
        <title>{process.env.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta key="og:title" property="og:title" content={process.env.title} />
        <meta
          key="og:description"
          property="og:description"
          content={process.env.description}
        />
        <meta
          key="og:image"
          property="og:image"
          content={process.env.shareImage}
        />
        <meta key="og:image:width" property="og:image:width" content="192" />
        <meta key="og:image:height" property="og:image:height" content="192" />
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
      </Head>
      <Navbar />
      <main className="main">
        <div className="container">
          <Component {...pageProps} />
        </div>
      </main>
      <footer className="footer">
        <p>
          Made by{' '}
          <a
            href="https://twitter.com/joaquimds"
            target="_blank"
            rel="noopener noreferrer"
          >
            @joaquimds
          </a>
          . Submissions welcome.
        </p>
      </footer>
    </div>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
}

export default MyApp
