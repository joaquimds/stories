import Link from 'next/link'
import * as PropTypes from 'prop-types'
import { useContext } from 'react'
import UserContext from '../../context/UserContext'
import NProgress from '../../services/nprogress'
import styles from './Navbar.module.scss'

const Navbar = () => {
  const nprogress = new NProgress()
  const onClickLogout = async () => {
    nprogress.start()
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    if (response.ok) {
      window.location.href = '/'
      return
    }
    nprogress.done()
  }
  const user = useContext(UserContext)
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <a className={styles.logo}>
          <img src="/tree.svg" alt={process.env.title} />
          <span>{process.env.title}</span>
        </a>
      </Link>
      <div className={styles.auth}>
        {user ? (
          <button type="button" className="link" onClick={onClickLogout}>
            Log Out
          </button>
        ) : (
          <Link href="/login">
            <a>Login</a>
          </Link>
        )}
      </div>
    </nav>
  )
}
Navbar.propTypes = {
  isAuthenticated: PropTypes.bool,
}

export default Navbar
