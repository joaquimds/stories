import Router from 'next/router'
import { useContext, useEffect } from 'react'
import Fragments from '../../components/Fragments/Fragments'
import withData from '../../containers/withData'
import UserContext from '../../context/UserContext'
import NProgress from '../../services/nprogress'

const FragmentsPage = () => {
  const user = useContext(UserContext)
  const nprogress = new NProgress()

  useEffect(() => {
    if (!user) {
      nprogress.start()
      Router.replace('/login')
    }
  }, [user])

  return user ? <Fragments /> : null
}

export default withData(FragmentsPage, { ssr: true })
