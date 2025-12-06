import { useQuery } from "@apollo/client/react"
import { MY_RECOMMENDATIONS } from "../queries"
import BookList from "./BookList"

const Recommendations = (props) => {
  const result = useQuery(MY_RECOMMENDATIONS, {
    skip: !props.show
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const genre = result.data.me.favoriteGenre
  const books = result.data.me.recommendations

  return (
    <div>
      <h2>Recommendations</h2>
      <p>books in your favorite genre <b>{genre}</b></p>
      <BookList books={books} />
    </div>
  )
}

export default Recommendations