import { ALL_BOOKS } from '../queries'

export const addBookToCache = (cache, book) => {
  // the user's own book arrives through the mutation and the subscription,
  // so only add it when it is not in the list yet
  cache.updateQuery({ query: ALL_BOOKS }, (data) => {
    if (!data || data.allBooks.some((b) => b.id === book.id)) {
      return undefined
    }
    return { allBooks: data.allBooks.concat(book) }
  })

  // the lists filtered by genre are cached separately, drop the ones the
  // new book belongs to so that open views fetch them again
  book.genres.forEach((genre) => {
    cache.evict({ fieldName: 'allBooks', args: { genre } })
  })
  cache.gc()
}
