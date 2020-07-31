import '../styles/app.scss'
import App from 'next/app'
import Router, { useRouter } from 'next/router'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head/Head'
import Navbar from '../components/Navbar/Navbar'
import UserContext from '../context/UserContext'

const MyApp = ({ Component, pageProps, user: initialUser }) => {
  const router = useRouter()
  const [user] = useState(initialUser)

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
    <UserContext.Provider value={user}>
      <div className={`root root--${router.asPath}`}>
        <Head />
        <Navbar />
        <main className="main">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </UserContext.Provider>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
  user: PropTypes.shape({
    id: PropTypes.string,
  }),
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)
  const { req } = appContext.ctx
  return {
    ...appProps,
    user: req ? req.user : null,
  }
}

export default MyApp
