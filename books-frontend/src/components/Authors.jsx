import { useMutation, useQuery } from "@apollo/client/react"
import { ALL_AUTHORS, UPDATE_AUTHOR_BIRTH_YEAR } from "../queries"
import { useState } from "react"

const Authors = (props) => {
  const [selectedAuthor, setSelectedAuthor] = useState()
  const [newBirthYear, setNewBirthYear] = useState()
  const result = useQuery(ALL_AUTHORS, {
    skip: !props.show
  })
  const [updateBirthYear] = useMutation(UPDATE_AUTHOR_BIRTH_YEAR)

  const handleSaveRow = () => {
    updateBirthYear({
      variables: {
        name: selectedAuthor,
        setBornTo: parseInt(newBirthYear)
      },
      refetchQueries: [
        { query: ALL_AUTHORS }
      ],
      onCompleted: () => {
        setSelectedAuthor(null)
      }
    })

  }

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
            <th></th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>
                {selectedAuthor !== a.name && a.born}
                {selectedAuthor && selectedAuthor === a.name && (
                  <input type="number" defaultValue={a.born} onChange={(e) => setNewBirthYear(e.target.value)} style={{ width: 45 }} />
                )}
              </td>
              <td>{a.bookCount}</td>
              <td>
                {!selectedAuthor && <button onClick={() => setSelectedAuthor(a.name)}>edit</button>}
                {selectedAuthor && selectedAuthor === a.name && (
                  <div>
                    <button type="submit" onClick={handleSaveRow}>save</button>
                    <button type="button" onClick={() => setSelectedAuthor(null)}>cancel</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
