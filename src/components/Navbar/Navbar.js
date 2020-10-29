import Link from 'next/link'
import PropTypes from 'prop-types'
import { useContext } from 'react'
import UserContext from '../../context/UserContext'
import styles from './Navbar.module.scss'

const Navbar = () => {
  const user = useContext(UserContext)
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <a className={styles.logo}>
          <img src="/tree.svg" alt={process.env.title} />
          <span>{process.env.title}</span>
        </a>
      </Link>
      <div className={styles.links}>
        <Link href="/faq">
          <a>FAQ</a>
        </Link>
        <Link href="/library">
          <a>Library</a>
        </Link>
        {user ? (
          <Link href="/account">
            <a>Account</a>
          </Link>
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
