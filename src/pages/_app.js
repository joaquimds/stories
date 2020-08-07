import '../styles/app.scss'
import App from 'next/app'
import Router, { useRouter } from 'next/router'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head/Head'
import Navbar from '../components/Navbar/Navbar'
import UserContext from '../context/UserContext'
import WrittenIdsContext from '../context/WrittenIdsContext'
import NProgress from '../services/nprogress'

const nprogress = new NProgress()

const MyApp = ({ Component, pageProps, user: initialUser }) => {
  const router = useRouter()
  const [user] = useState(initialUser)
  const writtenIdsState = useState([])

  useEffect(() => {
    Router.events.on('routeChangeStart', nprogress.start)
    Router.events.on('routeChangeComplete', nprogress.done)
    Router.events.on('routeChangeError', nprogress.done)
    return () => {
      Router.events.off('routeChangeStart', nprogress.start)
      Router.events.off('routeChangeComplete', nprogress.done)
      Router.events.off('routeChangeError', nprogress.done)
    }
  }, [])

  const path = router.asPath.split('#')[0]
  return (
    <UserContext.Provider value={user}>
      <WrittenIdsContext.Provider value={writtenIdsState}>
        <div className={`root root--${path}`}>
          <Head />
          <Navbar />
          <main className="main">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </WrittenIdsContext.Provider>
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
