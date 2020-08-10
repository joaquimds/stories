import Router from 'next/router'
import { useContext, useEffect } from 'react'
import Account from '../components/Account/Account'
import withData from '../containers/withData'
import UserContext from '../context/UserContext'
import NProgress from '../services/nprogress'

const AccountPage = () => {
  const user = useContext(UserContext)
  const nprogress = new NProgress()

  useEffect(() => {
    if (!user) {
      nprogress.start()
      Router.replace('/login')
    }
  }, [user])

  return user ? <Account /> : null
}

export default withData(AccountPage, { ssr: true })
