import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('booksapp-access-token'))
  const client = useApolloClient()

  const handleLoginSuccess = (jwtToken) => {
    setPage('authors')
    localStorage.setItem('booksapp-access-token', jwtToken)
    setToken(jwtToken)
  }

  const logout = () => {
    setToken()
    localStorage.clear()
    client.resetStore()
  }

  const loggedIn = token

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {loggedIn && (
          <>
            <button onClick={() => setPage('recommendations')}>redommendations</button>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => logout()}>logout</button>
          </>
        )}
        {!loggedIn && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors show={page === 'authors'} loggedIn={loggedIn} />

      <Books show={page === 'books'} />

      <Recommendations show={page === 'recommendations'} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}

export default App
