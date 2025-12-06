import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const Login = (props) => {
  const [login, { loading }] = useMutation(LOGIN)
  const [state, setState] = useState({
    username: '',
    password: ''
  })

  if (!props.show) {
    return null
  }

  const handleFieldChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    login({
      variables: {
        username: state.username,
        password: state.password
      }, onCompleted: (result) => {
        props.onLoginSuccess(result.login.value)
      }, onError: (result) => {
        alert(`Login failed: ${result.message}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          username
          <input name="username" onChange={handleFieldChange} />
        </label>
      </div>
      <div>
        <label>
          password
          <input name="password" type="password" onChange={handleFieldChange} />
        </label>
      </div>
      <button type="submit" disabled={loading}>login</button>
    </form>
  )
}

export default Login