import Link from 'next/link'
import { useContext, useState } from 'react'
import UserContext from '../../context/UserContext'
import NProgress from '../../services/nprogress'
import styles from './Account.module.scss'

const Account = () => {
  const user = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [isNotifiable, setNotifiable] = useState(user && user.isNotifiable)

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

  const updateNotifiable = async (checked) => {
    setLoading(true)
    setNotifiable(checked)
    nprogress.start()
    const response = await fetch('/api/me', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isNotifiable: checked }),
    })
    if (!response.ok) {
      setNotifiable(!checked)
    }
    setLoading(false)
    nprogress.done()
  }

  return (
    <div className={styles.account}>
      <h1>Account</h1>
      <div className={styles.notifications}>
        <input
          type="checkbox"
          id="notifiable"
          checked={isNotifiable}
          disabled={loading}
          onChange={(e) => updateNotifiable(e.target.checked)}
        />
        <label htmlFor="notifiable">Receive Email Notifications</label>
      </div>
      <ul>
        <li>
          <Link href="/account/fragments">
            <a>Your Fragments</a>
          </Link>
        </li>
        <li>
          <Link href="/account/links">
            <a>Your Links</a>
          </Link>
        </li>
        <li>
          <Link href="/account/favourites">
            <a>Your Favourites</a>
          </Link>
        </li>
        <li>
          <button
            id="logout"
            type="button"
            className="link"
            onClick={onClickLogout}
          >
            Log Out
          </button>
        </li>
      </ul>
    </div>
  )
}

export default Account
