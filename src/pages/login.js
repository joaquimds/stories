import Router from 'next/router'
import NProgress from 'nprogress'
import { useContext, useEffect } from 'react'
import Login from '../components/Login/Login'
import UserContext from '../context/UserContext'

const LoginPage = () => {
  const user = useContext(UserContext)

  useEffect(() => {
    if (user) {
      NProgress.start()
      Router.replace('/')
    }
  }, [user])

  return user ? null : <Login />
}

export default LoginPage
