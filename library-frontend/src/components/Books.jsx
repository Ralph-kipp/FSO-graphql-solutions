import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const result = useQuery(ALL_BOOKS)
  const filtered = useQuery(ALL_BOOKS, {
    variables: { genre },
    skip: !genre,
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks

  const genres = [...new Set(books.flatMap((b) => b.genres))].sort()

  const filterLoading = genre && (filtered.loading || !filtered.data)

  const booksToShow = genre ? filtered.data?.allBooks : books

  return (
    <div>
      <h2>books</h2>

      {genre && (
        <p>
          in genre <b>{genre}</b>
        </p>
      )}

      {filterLoading ? (
        <div>loading...</div>
      ) : (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {booksToShow.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
