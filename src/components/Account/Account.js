import { gql } from '@apollo/client/core'
import Link from 'next/link'
import NProgress from '../../services/nprogress'
import Sentence from '../Sentence/Sentence'
import styles from './Account.module.scss'

const Account = () => {
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

  return (
    <div className={styles.account}>
      <h1>Account</h1>
      <ul>
        <li>
          <Link href="/account/fragments">
            <a>Your Fragments</a>
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

Account.query = gql`
  query MySentences($search: String, $offset: Int) {
    mySentences(search: $search, offset: $offset) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

export default Account
