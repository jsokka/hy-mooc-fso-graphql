import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, GENRES } from "../queries"
import { useEffect, useState } from 'react'
import BookList from './BookList'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState()
  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre: selectedGenre
    },
    skip: !props.show
  })
  const genresResult = useQuery(GENRES, {
    skip: !props.show
  })

  const books = result?.data?.allBooks || []
  const genres = genresResult?.data?.genres || []

  useEffect(() => {
    if (props.show && !selectedGenre) {
      genresResult.refetch()
    }
  }, [props.show, genresResult, selectedGenre])

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      <button
        onClick={() => setSelectedGenre()}>
        {selectedGenre ? 'all' : <b>all</b>}
      </button>
      {genres.map((g) =>
        <button
          onClick={() => setSelectedGenre(g)}
          key={g}>
          {selectedGenre === g ? <b>{g}</b> : g}
        </button>
      )}
      {result.loading ? <p>Loading...</p> : (
        <>
          {selectedGenre && <p>in genre <b>{selectedGenre}</b></p>}
          <BookList books={books} />
        </>
      )}
    </div>
  )
}

export default Books
