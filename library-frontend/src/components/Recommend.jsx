import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommend = (props) => {
  const me = useQuery(ME, { skip: !props.token })
  const books = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (me.loading || books.loading || !me.data?.me || !books.data) {
    return <div>loading...</div>
  }

  const favoriteGenre = me.data.me.favoriteGenre

  const booksToShow = books.data.allBooks.filter((b) =>
    b.genres.includes(favoriteGenre)
  )

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>

      {booksToShow.length === 0 ? (
        <div>no books in your favorite genre</div>
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
    </div>
  )
}

export default Recommend
