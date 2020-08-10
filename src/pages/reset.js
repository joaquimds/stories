import { useEffect, useState } from 'react'
import { ERRORS } from '../constants'

const Reset = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)

  useEffect(() => {
    setToken(window.location.hash.substring(1))
    window.location.hash = ''
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })
      if (response.ok) {
        window.location.href = '/login'
        return
      }
      setLoading(false)
      setError(ERRORS[response.status])
    } catch (e) {
      setError('Unknown error')
    }
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={onSubmit} className="form">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          className="button submit"
          disabled={loading || password !== confirmPassword}
        >
          Submit
        </button>
        {error ? <small className="error">{error}</small> : null}
      </form>
    </div>
  )
}

export default Reset
