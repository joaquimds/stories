import Router from 'next/router'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect } from 'react'
import Login from '../components/Login/Login'

const LoginPage = ({ isAuthenticated }) => {
  useEffect(() => {
    if (isAuthenticated) {
      NProgress.start()
      Router.replace('/')
    }
  }, [isAuthenticated])

  return isAuthenticated ? null : <Login />
}

LoginPage.propTypes = {
  isAuthenticated: PropTypes.bool,
}

export const getServerSideProps = async ({ req }) => {
  return { props: { isAuthenticated: Boolean(req.user) } }
}

export default LoginPage
