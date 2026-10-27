import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Notify from './components/Notify'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('library-user-token'))
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('library-user-token')
    client.resetStore()
    setPage('authors')
  }

  // the add book view is only reachable while logged in, login only while logged out
  let currentPage = page
  if (page === 'add' && !token) {
    currentPage = 'authors'
  }
  if (page === 'login' && token) {
    currentPage = 'authors'
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Notify errorMessage={errorMessage} />

      <Authors
        show={currentPage === 'authors'}
        setError={notify}
        loggedIn={!!token}
      />

      <Books show={currentPage === 'books'} />

      <NewBook show={currentPage === 'add'} setError={notify} />

      <LoginForm
        show={currentPage === 'login'}
        setToken={setToken}
        setError={notify}
        onLoggedIn={() => setPage('authors')}
      />
    </div>
  )
}

export default App
