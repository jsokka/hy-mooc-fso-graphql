import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'
import { ALL_AUTHORS, ALL_BOOKS, AUTHOR_ADDED, BOOK_ADDED, MY_RECOMMENDATIONS } from './queries'


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('booksapp-access-token'))
  const client = useApolloClient()

  const updateBookCache = (addedBook, genre) => {
    const queryOptions = { query: ALL_BOOKS }
    if (genre) {
      queryOptions.variables = { genre }
    }
    client.cache.updateQuery(queryOptions, (data) => {
      if (data) {
        return {
          allBooks: data.allBooks.concat(addedBook)
        }
      }
    })
  }

  const updateRecommendationsCache = (bookAdded) => {
    const favoriteCache = client.cache.readQuery({ query: MY_RECOMMENDATIONS })?.me.favoriteGenre
    if (bookAdded.genres.includes(favoriteCache)) {
      client.cache.updateQuery({ query: MY_RECOMMENDATIONS }, (data) => {
        if (data) {
          return {
            me: {
              ...data.me,
              recommendations: data.me.recommendations.concat(bookAdded)
            }
          }
        }
      })
    }
  }

  const updateAuthorsCacheBookCount = (authorId) => {
    client.cache.updateQuery({ query: ALL_AUTHORS }, (data) => {
      if (data) {
        return {
          allAuthors: data.allAuthors.map(author => {
            if (author.id === authorId) {
              return { ...author, bookCount: author.bookCount + 1 }
            }
            return author
          })
        }
      }
    })
  }


  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded
      // Update every genre cache where the new book belongs
      bookAdded.genres.forEach(genre => {
        updateBookCache(bookAdded, genre)
      })

      // Also update the unfiltered cache (all books)
      updateBookCache(bookAdded, null)

      // Update recommendations cache
      updateRecommendationsCache(bookAdded)

      // Update author's book count
      updateAuthorsCacheBookCount(bookAdded.author.id)
    }
  })

  useSubscription(AUTHOR_ADDED, {
    onData: ({ data }) => {
      client.cache.updateQuery({ query: ALL_AUTHORS }, (currentData) => {
        if (currentData) {
          return {
            allAuthors: currentData.allAuthors.concat(data.data.authorAdded)
          }
        }
      })
    }
  })

  const handleLoginSuccess = (jwtToken) => {
    setPage('authors')
    localStorage.setItem('booksapp-access-token', jwtToken)
    setToken(jwtToken)
  }

  const logout = () => {
    setToken()
    localStorage.clear()
    client.resetStore()
    setPage('authors')
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
