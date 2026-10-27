import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { EDIT_AUTHOR } from '../queries'

const BirthYearForm = ({ authors, setError }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => setError(error.message),
    onCompleted: (data) => {
      if (!data.editAuthor) {
        setError('author not found')
      }
    },
  })

  const selectedName = name || authors[0]?.name

  const submit = (event) => {
    event.preventDefault()

    if (!born) {
      return
    }

    editAuthor({ variables: { name: selectedName, setBornTo: Number(born) } })

    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <select
            name="name"
            value={selectedName}
            onChange={({ target }) => setName(target.value)}
          >
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>
            born
            <input
              type="number"
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </label>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default BirthYearForm
