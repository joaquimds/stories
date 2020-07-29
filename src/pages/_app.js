import '../styles/app.scss'
import App from 'next/app'
import Router, { useRouter } from 'next/router'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head/Head'
import Navbar from '../components/Navbar/Navbar'

const MyApp = ({ Component, pageProps, isAuthenticated }) => {
  const router = useRouter()
  const [wasAuthenticated] = useState(isAuthenticated)

  useEffect(() => {
    Router.events.on('routeChangeStart', NProgress.start)
    Router.events.on('routeChangeComplete', NProgress.done)
    Router.events.on('routeChangeError', NProgress.done)
    return () => {
      Router.events.off('routeChangeStart', NProgress.start)
      Router.events.off('routeChangeComplete', NProgress.done)
      Router.events.off('routeChangeError', NProgress.done)
    }
  }, [])

  return (
    <div className={`root root--${router.asPath}`}>
      <Head />
      <Navbar isAuthenticated={wasAuthenticated} />
      <main className="main">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
  isAuthenticated: PropTypes.bool,
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)
  const { req } = appContext.ctx
  return {
    ...appProps,
    isAuthenticated: Boolean(req && req.user),
  }
}

export default MyApp
