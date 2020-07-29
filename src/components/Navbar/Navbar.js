import Link from 'next/link'
import * as PropTypes from 'prop-types'
import styles from './Navbar.module.scss'

const Navbar = ({ isAuthenticated }) => {
  const onClickLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    if (response.ok) {
      window.location.href = '/'
    }
  }
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <a className={styles.logo}>
          <img src="/tree.svg" alt={process.env.title} />
          <span>{process.env.title}</span>
        </a>
      </Link>
      <div className={styles.auth}>
        {isAuthenticated ? (
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
