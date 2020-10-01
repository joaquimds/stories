import Router from 'next/router'
import { useContext, useEffect } from 'react'
import Links from '../../components/Links/Links'
import withData from '../../containers/withData'
import UserContext from '../../context/UserContext'
import NProgress from '../../services/nprogress'

const LinksPage = () => {
  const user = useContext(UserContext)
  const nprogress = new NProgress()

  useEffect(() => {
    if (!user) {
      nprogress.start()
      Router.replace('/login')
    }
  }, [user])

  return user ? <Links /> : null
}

export default withData(LinksPage, { ssr: true })
