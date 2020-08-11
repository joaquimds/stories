import Router from 'next/router'
import { useContext, useEffect } from 'react'
import Favourites from '../../components/Favourites/Favourites'
import withData from '../../containers/withData'
import UserContext from '../../context/UserContext'
import NProgress from '../../services/nprogress'

const FavouritesPage = () => {
  const user = useContext(UserContext)
  const nprogress = new NProgress()

  useEffect(() => {
    if (!user) {
      nprogress.start()
      Router.replace('/login')
    }
  }, [user])

  return user ? <Favourites /> : null
}

export default withData(FavouritesPage, { ssr: true })
