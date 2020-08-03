import { useState } from 'react'
import styles from './Login.module.scss'

const MODES = { register: 'Register', login: 'Login' }

const Login = () => {
  const [mode, setMode] = useState(MODES.login)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isRegister = mode === MODES.register

  const onSubmit = async (e) => {
    e.preventDefault()
    const body = isRegister
      ? {
          email,
          password,
          name,
        }
      : { email, password }
    const url = `/api/${isRegister ? 'register' : 'login'}`
    const response = await fetch(url, {
      method: isRegister ? 'PUT' : 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (response.ok) {
      window.location.href = '/'
    }
  }
  const toggleMode = () => {
    setMode(isRegister ? MODES.login : MODES.register)
  }

  return (
    <div className={styles.login}>
      <h1>{mode}</h1>
      <form onSubmit={onSubmit} className={styles.form}>
        {isRegister ? (
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
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={`button ${styles.submit}`}>{mode}</button>
        <button
          type="button"
          className={`link ${styles.toggle}`}
          onClick={() => toggleMode()}
        >
          {isRegister ? MODES.login : MODES.register}
        </button>
      </form>
    </div>
  )
}

export default Login
