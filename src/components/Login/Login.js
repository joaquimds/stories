import { useState } from 'react'
import { ERRORS } from '../../constants'
import styles from './Login.module.scss'

const MODES = {
  register: 'Register',
  login: 'Login',
  forgotPassword: 'Forgot Password',
}

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(MODES.login)
  const [sentEmail, setSentEmail] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNotifiable, setNotifiable] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { path, body } = getRequestParams(mode, {
      name,
      email,
      password,
      isNotifiable,
    })
    try {
      const response = await fetch(path, {
        method: mode === MODES.register ? 'PUT' : 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        if (mode !== MODES.forgotPassword) {
          window.location.href = '/'
          return
        }
        return setSentEmail(true)
      }
      setLoading(false)
      setError(ERRORS[response.status])
    } catch (e) {
      setError('Unknown error')
    }
  }

  const changeMode = (nextMode) => {
    setError(null)
    setMode(nextMode)
  }

  const oppositeMode = mode === MODES.login ? MODES.register : MODES.login

  if (sentEmail) {
    return (
      <div className={styles.login}>
        <h1>{mode}</h1>
        <p>Please check your email for further instructions.</p>
      </div>
    )
  }

  return (
    <div className={styles.login}>
      <h1>{mode}</h1>
      <form onSubmit={onSubmit} className="form">
        {mode === MODES.register ? (
          <>
            <label htmlFor="name">Pen Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </>
        ) : null}
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode === MODES.register ? (
          <>
            <label htmlFor="notifiable">Receive Email Notifications</label>
            <small>(sent when other writers add to your stories)</small>
            <input
              type="checkbox"
              id="notifiable"
              checked={isNotifiable}
              onChange={(e) => setNotifiable(e.target.checked)}
            />
          </>
        ) : null}
        {mode !== MODES.forgotPassword ? (
          <>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </>
        ) : null}
        <button disabled={loading} className="button submit">
          {mode === MODES.forgotPassword ? 'Submit' : mode}
        </button>
        {error ? (
          <small className={`error ${styles.error}`}>{error}</small>
        ) : null}
        <button
          type="button"
          className={`link ${styles.toggle}`}
          onClick={() => changeMode(oppositeMode)}
        >
          {oppositeMode}
        </button>
        {mode !== MODES.forgotPassword ? (
          <button
            type="button"
            className={`link ${styles['forgot-password']}`}
            onClick={() => changeMode(MODES.forgotPassword)}
          >
            Forgot password
          </button>
        ) : null}
      </form>
    </div>
  )
}

const getRequestParams = (mode, { name, email, password, isNotifiable }) => {
  if (mode === MODES.forgotPassword) {
    return { path: '/api/forgot-password', body: { email } }
  }
  if (mode === MODES.login) {
    return { path: '/api/login', body: { email, password } }
  }
  return {
    path: '/api/register',
    body: { name, email, password, isNotifiable },
  }
}

export default Login
