const Notify = ({ errorMessage, infoMessage }) => {
  if (!errorMessage && !infoMessage) {
    return null
  }

  return (
    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {infoMessage && <div style={{ color: 'green' }}>{infoMessage}</div>}
    </div>
  )
}

export default Notify
